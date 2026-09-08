import type { MacroTotals, NutritionFacts, SourceServing } from "./nutrition";

export type MealPeriodId = "breakfast" | "lunch" | "dinner";

export type PlateRole =
  | "protein_anchor"
  | "carbohydrate"
  | "produce"
  | "fat_add_on";

export type DietMode =
  | "balanced"
  | "high_protein"
  | "low_carb"
  | "high_carb"
  | "keto_oriented"
  | "vegetarian"
  | "vegan"
  | "paleo_oriented";

export type MenuItem = {
  id: string;
  name: string;
  stationId: string;
  stationName: string;
  sourceOrder: number;
  serving: SourceServing | null;
  nutrition: NutritionFacts | null;
  ingredients: string[] | null;
  dietaryLabels: string[];
  allergenLabels: string[];
  roleCandidates: PlateRole[];
  dietTags: DietMode[];
};

export type DiningStation = {
  id: string;
  name: string;
  items: MenuItem[];
};

export type DiningPeriod = {
  id: MealPeriodId;
  name: string;
  startsAt: string;
  endsAt: string;
  stations: DiningStation[];
};

export type MenuFreshness = {
  menuDate: string;
  sourceFetchedAt: string;
  cachedAt: string;
  sourceStatus: "live" | "cached" | "fixture";
  freshness: "fresh" | "stale" | "invalid";
};

export type DiningMenu = {
  locationId: "gastronome";
  locationName: string;
  menuDate: string;
  sourceName: string;
  sourceUrl: string;
  freshness: MenuFreshness;
  periods: DiningPeriod[];
};

export type RecommendationAction = "take" | "add";

export type RecommendedItem = {
  item: MenuItem;
  servings: number;
  role: PlateRole;
  action: RecommendationAction;
  reasons: string[];
};

export type PlateRecommendation = {
  mode: DietMode;
  mealPeriod: MealPeriodId;
  menuDate: string;
  generatedAt: string;
  items: RecommendedItem[];
  totals: MacroTotals;
  explanation: string;
  recommendationVersion: "1.0.0";
};

export type PlateSelection = {
  item: MenuItem;
  servings: number;
};

export type DiaryItemSnapshot = {
  sourceItemId: string;
  itemName: string;
  stationName: string;
  servings: number;
  servingDescription: string;
  macros: MacroTotals;
};

export type DiaryEntry = {
  id: string;
  mealPeriod: MealPeriodId;
  menuDate: string;
  loggedAt: string;
  items: DiaryItemSnapshot[];
  totals: MacroTotals;
  recommendationVersion: string | null;
};
