export type MacroTotals = {
  calories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
};

export type NutritionFacts = MacroTotals & {
  saturatedFatGrams: number | null;
  fiberGrams: number | null;
  sugarGrams: number | null;
  sodiumMilligrams: number | null;
};

export type SourceServing = {
  quantity: number;
  unit: string;
  description: string;
  grams: number | null;
  multipliable: boolean;
};

export type NutritionGoals = MacroTotals;

export const emptyMacros: MacroTotals = {
  calories: 0,
  proteinGrams: 0,
  carbohydratesGrams: 0,
  fatGrams: 0,
};
