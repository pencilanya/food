export type UserRole = "parent" | "kid";

export type FoodConstraint =
  | "nuts"
  | "milk"
  | "gluten"
  | "eggs"
  | "fish"
  | "vegetarian";

export type ChildProfile = {
  id: string;
  name: string;
  age: number;
  constraints: FoodConstraint[];
  dislikedProductIds: string[];
  likedProductIds: string[];
};

export type GroceryProduct = {
  id: string;
  title: string;
  category: "main" | "fruit" | "snack" | "drink";
  priceRub: number;
  allergens: FoodConstraint[];
  imageUrl?: string;
  provider: "samokat" | "mock";
  providerProductId?: string;
};

export type Lunchbox = {
  id: string;
  childId: string;
  date: string;
  productIds: string[];
  status: "draft" | "approved" | "packed";
};

export function isProductAllowed(
  product: GroceryProduct,
  profile: ChildProfile,
): boolean {
  return !product.allergens.some((allergen) => profile.constraints.includes(allergen));
}
