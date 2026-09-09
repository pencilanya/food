import { mockCatalog } from "./catalog.ts";
import { calculateLunchboxBalance, calculateLunchboxPrice, calculateReward, filterCatalogForChild, transitionLunchboxStatus, validateLunchbox, validateLunchboxItem, validateProfile } from "./rules.ts";
import type { ActivityActor, ChangeRequest, ChildProfile, DemoState, FoodItem, LunchboxActivity, LunchboxRecommendationProvider, LunchboxSlot } from "./types.ts";

const isoDate = (date: Date) => date.toISOString().slice(0,10);
const addActivity = (state: DemoState, actor: ActivityActor, type: LunchboxActivity["type"], message: string, now = new Date().toISOString()): DemoState => ({ ...state, activities:[{ id:`activity-${now}-${type}`, actor, type, message, createdAt:now }, ...state.activities].slice(0,3) });
export function createInitialDemoState(now = new Date()): DemoState {
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1);
  const createdAt = now.toISOString();
  return { profile:{ id:"child-mila", familyId:"family-demo", name:"Мила", avatar:"🌸", restrictedAllergens:["nuts"], preferences:{ likedTags:["fruit","crunchy"], dislikedTags:["junk"] }, maxLunchboxPriceKopecks:52000 }, lunchbox:{ id:`lunchbox-${isoDate(tomorrow)}`, childId:"child-mila", deliveryDate:isoDate(tomorrow), status:"draft", items:[], balanceScore:0, priceKopecks:0, createdAt, updatedAt:createdAt }, rewards:[], activities:[] };
}
export const initialDemoState: DemoState = createInitialDemoState();

export class MockRecommendationProvider implements LunchboxRecommendationProvider {
  async suggestItems({ profile, slot, catalog }: Parameters<LunchboxRecommendationProvider["suggestItems"]>[0]): Promise<FoodItem[]> {
    return filterCatalogForChild(catalog, profile).filter((food) => food.allowedSlots.includes(slot)).sort((a,b) => Number(b.tags.some((tag) => profile.preferences.likedTags.includes(tag))) - Number(a.tags.some((tag) => profile.preferences.likedTags.includes(tag)))).slice(0,3);
  }
}

export function withItem(state: DemoState, slot: LunchboxSlot, foodItemId: string, actor: ActivityActor = "child"): DemoState {
  const selected = { slot, foodItemId };
  const validation = validateLunchboxItem(selected, state.profile, mockCatalog);
  if (!validation.valid) throw new Error(validation.issues[0]?.message ?? "Продукт недоступен");
  const items = [...state.lunchbox.items.filter((entry) => entry.slot !== slot), selected];
  const priceKopecks = calculateLunchboxPrice(items, mockCatalog);
  if (priceKopecks > state.profile.maxLunchboxPriceKopecks) throw new Error("Этот выбор превысит бюджет");
  const previous = state.lunchbox.items.find((entry)=>entry.slot===slot);
  const now = new Date().toISOString();
  const next = { ...state, lunchbox:{ ...state.lunchbox, items, priceKopecks, balanceScore:calculateLunchboxBalance(items, mockCatalog).score, updatedAt:now } };
  const food = mockCatalog.find((entry)=>entry.id===foodItemId);
  return addActivity(next, actor, previous ? "item_replaced" : "item_added", `${previous ? "Заменён" : "Добавлен"} продукт «${food?.title ?? foodItemId}»`, now);
}
export function withoutItem(state: DemoState, slot: LunchboxSlot, actor: ActivityActor = "child"): DemoState { const removed=state.lunchbox.items.find((entry)=>entry.slot===slot); const items = state.lunchbox.items.filter((entry) => entry.slot !== slot); const now=new Date().toISOString(); const next={ ...state, lunchbox:{ ...state.lunchbox, items, priceKopecks:calculateLunchboxPrice(items,mockCatalog), balanceScore:calculateLunchboxBalance(items,mockCatalog).score, updatedAt:now } }; const food=mockCatalog.find((entry)=>entry.id===removed?.foodItemId); return addActivity(next,actor,"item_removed",`Убран продукт «${food?.title??"из бокса"}»`,now); }
export function submitLunchbox(state: DemoState): DemoState { const validation=validateLunchbox(state.lunchbox,state.profile,mockCatalog); if(!validation.valid)throw new Error(validation.issues[0]?.message??"Бокс не готов"); const now=new Date().toISOString(); const next={ ...state, changeRequest:undefined, lunchbox:{ ...state.lunchbox, status:transitionLunchboxStatus(state.lunchbox.status,"submit"), updatedAt:now } }; return addActivity(next,"child","submitted","Бокс отправлен родителю на проверку",now); }
export function approveLunchbox(state: DemoState): DemoState { const validation=validateLunchbox(state.lunchbox,state.profile,mockCatalog); if(!validation.valid)throw new Error(validation.issues[0]?.message??"Бокс нельзя одобрить"); const status = transitionLunchboxStatus(state.lunchbox.status,"approve"); const now=new Date().toISOString(); const reward = calculateReward(state.lunchbox.balanceScore,state.lunchbox.id,state.profile.id,state.rewards,now); const next={ ...state, changeRequest:undefined, lunchbox:{ ...state.lunchbox, status, updatedAt:now }, rewards:reward ? [...state.rewards,reward] : state.rewards }; return addActivity(next,"parent","approved",`Бокс одобрен${reward?` · +${reward.amount} монеты`:""}`,now); }
export function requestLunchboxChanges(state: DemoState, request: Omit<ChangeRequest,"createdAt">): DemoState { const now=new Date().toISOString(); const status=transitionLunchboxStatus(state.lunchbox.status,"request_changes"); const next={...state,changeRequest:{...request,createdAt:now},lunchbox:{...state.lunchbox,status,updatedAt:now}}; return addActivity(next,"parent","changes_requested",request.comment||"Бокс возвращён на доработку",now); }
export function updateChildProfile(state: DemoState, profile: ChildProfile): DemoState { const profileValidation=validateProfile(profile); if(!profileValidation.valid)throw new Error(profileValidation.issues[0]?.message??"Проверьте профиль"); const now=new Date().toISOString(); const normalized={...profile,name:profile.name.trim()}; let next:DemoState={...state,profile:normalized,lunchbox:{...state.lunchbox,updatedAt:now}}; const boxValidation=validateLunchbox(next.lunchbox,next.profile,mockCatalog); if(!boxValidation.valid&&next.lunchbox.items.length){ const slots=[...new Set(boxValidation.issues.map((issue)=>issue.slot).filter((slot):slot is LunchboxSlot=>Boolean(slot)))]; const comment=boxValidation.issues.map((issue)=>issue.message).filter((message,index,all)=>all.indexOf(message)===index).join(" · "); next={...next,rewards:state.lunchbox.status==="approved"?state.rewards.filter((reward)=>reward.lunchboxId!==state.lunchbox.id):state.rewards,changeRequest:{reason:boxValidation.issues.some((issue)=>issue.code==="restricted_allergen")?"allergy":"budget",slots,comment,createdAt:now},lunchbox:{...next.lunchbox,status:"changes_requested"}}; } next=addActivity(next,"parent","profile_updated","Профиль ребёнка обновлён",now); return next; }
