import assert from "node:assert/strict";
import test from "node:test";
import { approveLunchbox, calculateLunchboxBalance, calculateLunchboxPrice, calculateReward, filterCatalogForChild, initialDemoState, mockCatalog, requestLunchboxChanges, submitLunchbox, transitionLunchboxStatus, updateChildProfile, validateLunchbox, validateLunchboxItem, validateProfile, withItem, type DemoState } from "./index.ts";

const profile = { ...initialDemoState.profile, restrictedAllergens: ["nuts", "milk"] as const, maxLunchboxPriceKopecks: 50000 };

test("filters products containing any restricted allergen", () => {
  const result = filterCatalogForChild(mockCatalog, { ...profile, restrictedAllergens: [...profile.restrictedAllergens] });
  assert.equal(result.some((food) => food.id === "nut-bar" || food.id === "yogurt"), false);
});

test("rejects restricted allergen and wrong slot", () => {
  assert.equal(validateLunchboxItem({ slot:"snack", foodItemId:"nut-bar" }, { ...profile, restrictedAllergens:[...profile.restrictedAllergens] }, mockCatalog).issues[0]?.code, "restricted_allergen");
  assert.equal(validateLunchboxItem({ slot:"drink", foodItemId:"apple" }, { ...profile, restrictedAllergens:[...profile.restrictedAllergens] }, mockCatalog).issues[0]?.code, "wrong_slot");
});

test("detects duplicate, empty, incomplete, and over-budget lunchboxes", () => {
  const empty = validateLunchbox({ items:[] }, { ...profile, restrictedAllergens:[...profile.restrictedAllergens] }, mockCatalog);
  assert.equal(empty.issues.filter((issue) => issue.code === "missing_slot").length, 4);
  const duplicate = validateLunchbox({ items:[{slot:"snack",foodItemId:"chips"},{slot:"snack",foodItemId:"crackers"}] }, { ...profile, restrictedAllergens:[...profile.restrictedAllergens] }, mockCatalog);
  assert.equal(duplicate.issues.some((issue) => issue.code === "duplicate_slot"), true);
  const expensive = validateLunchbox({ items:[{slot:"main",foodItemId:"chicken-rice"},{slot:"snack",foodItemId:"crackers"},{slot:"fruit_or_vegetable",foodItemId:"berries"},{slot:"drink",foodItemId:"apple-juice"}] }, { ...profile, restrictedAllergens:[...profile.restrictedAllergens], maxLunchboxPriceKopecks:30000 }, mockCatalog);
  assert.equal(expensive.issues.some((issue) => issue.code === "over_budget"), true);
});

test("calculates integer price and deterministic balance", () => {
  const base = [{slot:"main",foodItemId:"chicken-rice"},{slot:"snack",foodItemId:"chips"}] as const;
  const improved = [...base.slice(0,1), {slot:"snack",foodItemId:"crackers"} as const, {slot:"fruit_or_vegetable",foodItemId:"apple"} as const];
  assert.equal(calculateLunchboxPrice([...base], mockCatalog), 32500);
  assert.ok(calculateLunchboxBalance(improved, mockCatalog).score > calculateLunchboxBalance([...base], mockCatalog).score);
  assert.equal(calculateLunchboxBalance([...base], mockCatalog).reasons.some((reason) => reason.code === "less_junk"), true);
});

test("rewards once and guards status transitions", () => {
  const reward = calculateReward(90,"box","child",[]);
  assert.equal(reward?.amount, 3);
  assert.equal(calculateReward(90,"box","child",reward ? [reward] : []), null);
  assert.equal(transitionLunchboxStatus("draft","submit"), "pending_approval");
  assert.equal(transitionLunchboxStatus("pending_approval","approve"), "approved");
  assert.throws(() => transitionLunchboxStatus("draft","approve"));
  assert.throws(() => transitionLunchboxStatus("approved","approve"));
});

test("parent replacement cannot bypass restrictions or budget", () => {
  const state: DemoState = { ...initialDemoState, profile:{ ...initialDemoState.profile, restrictedAllergens:["nuts"] } };
  assert.throws(() => withItem(state, "snack", "nut-bar"));
  assert.throws(() => withItem({ ...state, profile:{ ...state.profile, maxLunchboxPriceKopecks:1000 } }, "main", "chicken-rice"));
});

test("approval creates only one reward transaction", () => {
  let pending: DemoState = { ...initialDemoState, activities:[], lunchbox:{ ...initialDemoState.lunchbox } };
  pending=withItem(pending,"main","chicken-rice"); pending=withItem(pending,"snack","crackers"); pending=withItem(pending,"fruit_or_vegetable","apple"); pending=withItem(pending,"drink","water"); pending=submitLunchbox(pending);
  const once = approveLunchbox(pending);
  assert.equal(once.rewards.length, 1);
  assert.throws(() => approveLunchbox(once));
});

test("submit and approval cannot bypass full validation", () => {
  assert.throws(() => submitLunchbox(initialDemoState));
  const invalidPending: DemoState={...initialDemoState,activities:[],lunchbox:{...initialDemoState.lunchbox,status:"pending_approval"}};
  assert.throws(() => approveLunchbox(invalidPending));
});

test("profile prevents preference conflicts and rechecks an existing box", () => {
  assert.equal(validateProfile({...initialDemoState.profile,preferences:{likedTags:["fresh"],dislikedTags:["fresh"]}}).valid,false);
  let state:DemoState={...initialDemoState,activities:[],lunchbox:{...initialDemoState.lunchbox}};
  state=withItem(state,"main","chicken-rice");state=withItem(state,"snack","yogurt");state=withItem(state,"fruit_or_vegetable","apple");state=withItem(state,"drink","water");state=submitLunchbox(state);
  const changed=updateChildProfile(state,{...state.profile,restrictedAllergens:[...state.profile.restrictedAllergens,"milk"]});
  assert.equal(changed.lunchbox.status,"changes_requested");
  assert.equal(changed.changeRequest?.reason,"allergy");
});

test("parent can request changes with a child-visible comment", () => {
  let state:DemoState={...initialDemoState,activities:[],lunchbox:{...initialDemoState.lunchbox}};
  state=withItem(state,"main","chicken-rice");state=withItem(state,"snack","crackers");state=withItem(state,"fruit_or_vegetable","apple");state=withItem(state,"drink","water");state=submitLunchbox(state);
  const changed=requestLunchboxChanges(state,{reason:"preference",slots:["snack"],comment:"Давай другой перекус"});
  assert.equal(changed.lunchbox.status,"changes_requested");
  assert.equal(changed.changeRequest?.comment,"Давай другой перекус");
  assert.equal(changed.activities[0]?.actor,"parent");
});

test("invalidating an approved box revokes its reward until safe reapproval", () => {
  let state:DemoState={...initialDemoState,activities:[],lunchbox:{...initialDemoState.lunchbox}};
  state=withItem(state,"main","chicken-rice");state=withItem(state,"snack","yogurt");state=withItem(state,"fruit_or_vegetable","apple");state=withItem(state,"drink","water");state=approveLunchbox(submitLunchbox(state));
  assert.equal(state.rewards.length,1);
  const invalidated=updateChildProfile(state,{...state.profile,restrictedAllergens:[...state.profile.restrictedAllergens,"milk"]});
  assert.equal(invalidated.lunchbox.status,"changes_requested");
  assert.equal(invalidated.rewards.length,0);
  assert.equal(invalidated.changeRequest?.slots.includes("snack"),true);
});

test("resubmission clears the change request and permits exactly one fresh reward", () => {
  let state:DemoState={...initialDemoState,activities:[],lunchbox:{...initialDemoState.lunchbox}};
  state=withItem(state,"main","chicken-rice");state=withItem(state,"snack","crackers");state=withItem(state,"fruit_or_vegetable","apple");state=withItem(state,"drink","water");state=submitLunchbox(state);
  state=requestLunchboxChanges(state,{reason:"preference",slots:["snack"],comment:"Другой перекус"});
  state=withItem(state,"snack","oat-bites");state=submitLunchbox(state);
  assert.equal(state.changeRequest,undefined);
  assert.equal(state.lunchbox.status,"pending_approval");
  state=approveLunchbox(state);
  assert.equal(state.rewards.length,1);
  assert.equal(state.lunchbox.status,"approved");
});
