export type UserRole = "parent" | "child";
export type Family = { id: string };
export type LunchboxSlot = "main" | "snack" | "fruit_or_vegetable" | "drink";
export type FoodCategory = "sandwiches" | "dairy" | "snacks" | "fruits" | "vegetables" | "drinks" | "mains";
export type FoodTag = "protein" | "fiber" | "fruit" | "vegetable" | "whole_grain" | "dairy" | "low_sugar" | "junk" | "crunchy" | "filling" | "fresh";
export type Allergen = "nuts" | "peanuts" | "milk" | "gluten" | "egg" | "soy" | "fish" | "shellfish" | "sesame";
export type ChildProfile = { id: string; familyId: string; name: string; avatar?: string; restrictedAllergens: Allergen[]; preferences: { likedTags: FoodTag[]; dislikedTags: FoodTag[] }; maxLunchboxPriceKopecks: number };
export type FoodItem = { id: string; title: string; description?: string; category: FoodCategory; allowedSlots: LunchboxSlot[]; caloriesKcal?: number; proteinGrams?: number; carbsGrams?: number; fatGrams?: number; fiberGrams?: number; sugarGrams?: number; allergens: Allergen[]; tags: FoodTag[]; priceKopecks: number; imageUrl?: string; emoji: string; provider: "mock" | "samokat" };
export type LunchboxItem = { slot: LunchboxSlot; foodItemId: string };
export type LunchboxStatus = "draft" | "pending_approval" | "approved" | "changes_requested";
export type Lunchbox = { id: string; childId: string; deliveryDate: string; status: LunchboxStatus; items: LunchboxItem[]; balanceScore: number; priceKopecks: number; createdAt: string; updatedAt: string };
export type BalanceReason = { type: "positive" | "suggestion"; code: string; message: string };
export type BalanceScoreResult = { score: number; reasons: BalanceReason[] };
export type RewardTransaction = { id: string; childId: string; lunchboxId?: string; amount: number; reason: string; createdAt: string };
export type ValidationIssue = { code: string; message: string; slot?: LunchboxSlot; foodItemId?: string };
export type ValidationResult = { valid: boolean; issues: ValidationIssue[] };
export type MascotReaction = { state: "empty" | "building" | "needs_improvement" | "balanced" | "complete"; message: string };
export type ChangeRequestReason = "allergy" | "budget" | "preference" | "balance" | "other";
export type ChangeRequest = { reason: ChangeRequestReason; slots: LunchboxSlot[]; comment: string; createdAt: string };
export type ActivityActor = "child" | "parent" | "system";
export type ActivityType = "item_added" | "item_removed" | "item_replaced" | "submitted" | "changes_requested" | "approved" | "profile_updated";
export type LunchboxActivity = { id: string; actor: ActivityActor; type: ActivityType; message: string; createdAt: string };
export interface CatalogProvider { getItems(): Promise<FoodItem[]> }
export interface LunchboxRecommendationProvider { suggestItems(input: { profile: ChildProfile; slot: LunchboxSlot; catalog: FoodItem[] }): Promise<FoodItem[]> }
export type DemoState = { profile: ChildProfile; lunchbox: Lunchbox; rewards: RewardTransaction[]; changeRequest?: ChangeRequest; activities: LunchboxActivity[] };
