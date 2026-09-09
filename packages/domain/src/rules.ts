import type { BalanceScoreResult, ChildProfile, FoodItem, Lunchbox, LunchboxItem, LunchboxSlot, MascotReaction, RewardTransaction, ValidationIssue, ValidationResult } from "./types.ts";

export const REQUIRED_SLOTS: LunchboxSlot[] = ["main", "snack", "fruit_or_vegetable", "drink"];

export function filterCatalogForChild(catalog: FoodItem[], profile: ChildProfile): FoodItem[] {
  return catalog.filter((food) => !food.allergens.some((allergen) => profile.restrictedAllergens.includes(allergen)));
}

export function validateLunchboxItem(item: LunchboxItem, profile: ChildProfile, catalog: FoodItem[]): ValidationResult {
  const food = catalog.find((entry) => entry.id === item.foodItemId);
  const issues: ValidationIssue[] = [];
  if (!food) issues.push({ code: "missing_product", message: "Продукт не найден", slot: item.slot, foodItemId: item.foodItemId });
  if (food && !food.allowedSlots.includes(item.slot)) issues.push({ code: "wrong_slot", message: "Продукт не подходит для этого отделения", slot: item.slot, foodItemId: item.foodItemId });
  if (food && food.allergens.some((allergen) => profile.restrictedAllergens.includes(allergen))) issues.push({ code: "restricted_allergen", message: "Продукт содержит запрещённый аллерген", slot: item.slot, foodItemId: item.foodItemId });
  return { valid: issues.length === 0, issues };
}

export function calculateLunchboxPrice(items: LunchboxItem[], catalog: FoodItem[]): number {
  return items.reduce((total, selected) => total + (catalog.find((food) => food.id === selected.foodItemId)?.priceKopecks ?? 0), 0);
}

export function validateLunchbox(lunchbox: Pick<Lunchbox, "items">, profile: ChildProfile, catalog: FoodItem[]): ValidationResult {
  const issues = lunchbox.items.flatMap((selected) => validateLunchboxItem(selected, profile, catalog).issues);
  const seen = new Set<LunchboxSlot>();
  for (const selected of lunchbox.items) {
    if (seen.has(selected.slot)) issues.push({ code: "duplicate_slot", message: "В одном отделении может быть только один продукт", slot: selected.slot });
    seen.add(selected.slot);
  }
  for (const slot of REQUIRED_SLOTS) if (!seen.has(slot)) issues.push({ code: "missing_slot", message: "Заполни все четыре отделения", slot });
  if (calculateLunchboxPrice(lunchbox.items, catalog) > profile.maxLunchboxPriceKopecks) issues.push({ code: "over_budget", message: "Бокс не укладывается в бюджет" });
  return { valid: issues.length === 0, issues };
}

export function validateProfile(profile: ChildProfile): ValidationResult {
  const issues: ValidationIssue[] = [];
  if (!profile.name.trim()) issues.push({ code:"missing_name", message:"Укажите имя ребёнка" });
  if (!Number.isFinite(profile.maxLunchboxPriceKopecks) || profile.maxLunchboxPriceKopecks < 10000 || profile.maxLunchboxPriceKopecks > 200000) issues.push({ code:"invalid_budget", message:"Укажите бюджет от 100 до 2 000 ₽" });
  const conflicts = profile.preferences.likedTags.filter((tag) => profile.preferences.dislikedTags.includes(tag));
  if (conflicts.length) issues.push({ code:"preference_conflict", message:"Один вкус не может одновременно нравиться и не нравиться" });
  return { valid: issues.length === 0, issues };
}

export function getPreferenceMatch(food: FoodItem, profile: ChildProfile): "liked" | "disliked" | "neutral" {
  if (food.tags.some((tag) => profile.preferences.dislikedTags.includes(tag))) return "disliked";
  if (food.tags.some((tag) => profile.preferences.likedTags.includes(tag))) return "liked";
  return "neutral";
}

export function calculateLunchboxBalance(items: LunchboxItem[], catalog: FoodItem[]): BalanceScoreResult {
  const selected = items.map((entry) => catalog.find((food) => food.id === entry.foodItemId)).filter((food): food is FoodItem => Boolean(food));
  const reasons: BalanceScoreResult["reasons"] = [];
  let score = 0;
  if (items.some((entry) => entry.slot === "main")) { score += 25; reasons.push({ type:"positive", code:"main", message:"Есть сытная основа" }); }
  if (items.some((entry) => entry.slot === "fruit_or_vegetable")) { score += 25; reasons.push({ type:"positive", code:"fresh", message:"Добавлено что-то свежее" }); } else reasons.push({ type:"suggestion", code:"add_fresh", message:"Добавьте фрукт или овощ" });
  if (items.some((entry) => entry.slot === "drink")) { score += 15; reasons.push({ type:"positive", code:"drink", message:"Напиток на месте" }); }
  if (selected.some((food) => food.tags.includes("protein"))) { score += 15; reasons.push({ type:"positive", code:"protein", message:"Есть источник белка" }); } else reasons.push({ type:"suggestion", code:"add_protein", message:"Можно добавить что-то сытное" });
  if (selected.some((food) => food.tags.includes("fiber"))) { score += 10; reasons.push({ type:"positive", code:"fiber", message:"Есть клетчатка" }); } else reasons.push({ type:"suggestion", code:"add_fiber", message:"Можно добавить больше клетчатки" });
  if (selected.some((food) => food.tags.includes("junk"))) { score -= 10; reasons.push({ type:"suggestion", code:"less_junk", message:"Хрустящую закуску можно заменить на более сытную" }); }
  if (selected.reduce((sum, food) => sum + (food.sugarGrams ?? 0), 0) > 30) { score -= 10; reasons.push({ type:"suggestion", code:"less_sugar", message:"Можно выбрать напиток без добавленного сахара" }); }
  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export function calculateReward(score: number, lunchboxId: string, childId: string, transactions: RewardTransaction[], now = new Date().toISOString()): RewardTransaction | null {
  if (transactions.some((transaction) => transaction.lunchboxId === lunchboxId)) return null;
  const amount = score >= 90 ? 3 : score >= 75 ? 2 : score >= 60 ? 1 : 0;
  return amount ? { id:`reward-${lunchboxId}`, childId, lunchboxId, amount, reason:"За сбалансированный ланчбокс", createdAt:now } : null;
}

export function transitionLunchboxStatus(status: Lunchbox["status"], action: "submit" | "approve" | "request_changes"): Lunchbox["status"] {
  if (action === "submit" && (status === "draft" || status === "changes_requested")) return "pending_approval";
  if (action === "approve" && status === "pending_approval") return "approved";
  if (action === "request_changes" && status === "pending_approval") return "changes_requested";
  throw new Error(`Invalid lunchbox transition: ${status} -> ${action}`);
}

export function getMascotReaction(lunchbox: Pick<Lunchbox, "items" | "balanceScore">): MascotReaction {
  if (!lunchbox.items.length) return { state:"empty", message:"Что положим сегодня?" };
  if (lunchbox.items.length < 4) return lunchbox.items.some((entry) => entry.slot === "fruit_or_vegetable") ? { state:"building", message:"Уже выглядит вкусно ✨" } : { state:"needs_improvement", message:"А добавим что-нибудь свежее? 🌱" };
  return lunchbox.balanceScore >= 75 ? { state:"complete", message:"Бокс готов! 🥳" } : { state:"balanced", message:"Ого! Хороший баланс." };
}

export function priceToStars(priceKopecks: number, budgetKopecks: number): number {
  return Math.max(0, Math.min(5, 5 - Math.ceil(Math.max(0, priceKopecks - budgetKopecks * .4) / (budgetKopecks * .12))));
}
