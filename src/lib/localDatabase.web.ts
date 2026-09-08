import type { DiaryEntry, DietMode, MealPeriodId, PlateSelection } from "@/types/dining";
import type { NutritionGoals } from "@/types/nutrition";
import { totalSelections } from "@/utils/macros";

const DIARY_KEY = "gspot-eats.diary.v1";
const PREFERENCES_KEY = "gspot-eats.preferences.v1";

function storage(): Storage | null {
  return typeof globalThis.localStorage === "undefined" ? null : globalThis.localStorage;
}

function makeId() {
  return `meal-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDiaryEntry(input: {
  selections: PlateSelection[];
  mealPeriod: MealPeriodId;
  menuDate: string;
  loggedAt?: string;
  recommendationVersion?: string | null;
}): DiaryEntry {
  return {
    id: makeId(),
    mealPeriod: input.mealPeriod,
    menuDate: input.menuDate,
    loggedAt: input.loggedAt ?? new Date().toISOString(),
    items: input.selections.map(({ item, servings }) => ({
      sourceItemId: item.id,
      itemName: item.name,
      stationName: item.stationName,
      servings,
      servingDescription: item.serving?.description ?? "Serving unavailable",
      macros: item.nutrition
        ? {
            calories: item.nutrition.calories * servings,
            proteinGrams: item.nutrition.proteinGrams * servings,
            carbohydratesGrams: item.nutrition.carbohydratesGrams * servings,
            fatGrams: item.nutrition.fatGrams * servings,
          }
        : { calories: 0, proteinGrams: 0, carbohydratesGrams: 0, fatGrams: 0 },
    })),
    totals: totalSelections(input.selections),
    recommendationVersion: input.recommendationVersion ?? null,
  };
}

export async function insertDiaryEntry(entry: DiaryEntry) {
  const current = await listDiaryEntries();
  storage()?.setItem(DIARY_KEY, JSON.stringify([entry, ...current]));
}

export async function listDiaryEntries(): Promise<DiaryEntry[]> {
  const value = storage()?.getItem(DIARY_KEY);
  return value ? JSON.parse(value) as DiaryEntry[] : [];
}

export async function clearDiaryEntries() {
  storage()?.removeItem(DIARY_KEY);
}

export type AppPreferences = { defaultDietMode: DietMode; goals: NutritionGoals };
export const defaultPreferences: AppPreferences = {
  defaultDietMode: "balanced",
  goals: { calories: 2200, proteinGrams: 140, carbohydratesGrams: 240, fatGrams: 75 },
};

export async function getPreferences(): Promise<AppPreferences> {
  const value = storage()?.getItem(PREFERENCES_KEY);
  return value ? { ...defaultPreferences, ...(JSON.parse(value) as AppPreferences) } : defaultPreferences;
}

export async function setPreferences(preferences: AppPreferences) {
  storage()?.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}
