import type {
  DietMode,
  DiningMenu,
  MealPeriodId,
  MenuItem,
  PlateRecommendation,
  PlateRole,
  PlateSelection,
  RecommendedItem,
} from "@/types/dining";
import { emptyMacros, type MacroTotals } from "@/types/nutrition";

export const dietModes: { id: DietMode; label: string; shortLabel: string }[] = [
  { id: "balanced", label: "Balanced", shortLabel: "Balanced" },
  { id: "high_protein", label: "High protein", shortLabel: "Protein" },
  { id: "low_carb", label: "Low carb", shortLabel: "Low carb" },
  { id: "high_carb", label: "High carb", shortLabel: "High carb" },
  { id: "keto_oriented", label: "Keto-oriented", shortLabel: "Keto" },
  { id: "vegetarian", label: "Vegetarian", shortLabel: "Vegetarian" },
  { id: "vegan", label: "Vegan", shortLabel: "Vegan" },
  { id: "paleo_oriented", label: "Paleo-oriented", shortLabel: "Paleo" },
];

const round = (value: number) => Math.round(value * 10) / 10;

export function addMacros(a: MacroTotals, b: MacroTotals): MacroTotals {
  return {
    calories: round(a.calories + b.calories),
    proteinGrams: round(a.proteinGrams + b.proteinGrams),
    carbohydratesGrams: round(a.carbohydratesGrams + b.carbohydratesGrams),
    fatGrams: round(a.fatGrams + b.fatGrams),
  };
}

export function scaleMacros(macros: MacroTotals, servings: number): MacroTotals {
  return {
    calories: round(macros.calories * servings),
    proteinGrams: round(macros.proteinGrams * servings),
    carbohydratesGrams: round(macros.carbohydratesGrams * servings),
    fatGrams: round(macros.fatGrams * servings),
  };
}

export function totalSelections(selections: PlateSelection[]): MacroTotals {
  return selections.reduce((total, selection) => {
    if (!selection.item.nutrition) return total;
    return addMacros(total, scaleMacros(selection.item.nutrition, selection.servings));
  }, emptyMacros);
}

function supportsDiet(item: MenuItem, mode: DietMode): boolean {
  if (mode === "vegetarian") {
    return item.dietTags.includes("vegetarian") || item.dietTags.includes("vegan");
  }
  if (mode === "vegan") return item.dietTags.includes("vegan");
  if (mode === "paleo_oriented") return item.dietTags.includes("paleo_oriented");
  return true;
}

function score(item: MenuItem, mode: DietMode): number {
  const nutrition = item.nutrition!;
  switch (mode) {
    case "high_protein":
      return nutrition.proteinGrams * 5 - nutrition.calories * 0.025;
    case "low_carb":
      return nutrition.proteinGrams * 2.5 - nutrition.carbohydratesGrams * 3;
    case "high_carb":
      return nutrition.carbohydratesGrams * 2 + nutrition.proteinGrams * 0.5;
    case "keto_oriented":
      return nutrition.fatGrams * 2 + nutrition.proteinGrams - nutrition.carbohydratesGrams * 4;
    case "vegetarian":
    case "vegan":
    case "paleo_oriented":
    case "balanced":
      return nutrition.proteinGrams * 1.6 + Math.min(nutrition.carbohydratesGrams, 35) - Math.abs(nutrition.calories - 250) * 0.04;
  }
}

function rolesFor(mode: DietMode): PlateRole[] {
  if (mode === "low_carb" || mode === "keto_oriented") {
    return ["protein_anchor", "produce", "fat_add_on"];
  }
  if (mode === "high_carb") return ["carbohydrate", "protein_anchor", "produce"];
  return ["protein_anchor", "carbohydrate", "produce"];
}

function reasonsFor(item: MenuItem, mode: DietMode, role: PlateRole): string[] {
  const reasons = [`Fills the ${role.replace("_", " ")} role`];
  if (mode === "high_protein") reasons.push(`${item.nutrition!.proteinGrams}g protein per source serving`);
  if (mode === "low_carb" || mode === "keto_oriented") reasons.push(`${item.nutrition!.carbohydratesGrams}g carbs per source serving`);
  if (mode === "high_carb") reasons.push(`${item.nutrition!.carbohydratesGrams}g carbs per source serving`);
  if (["vegetarian", "vegan", "paleo_oriented"].includes(mode)) reasons.push("Matches available source or reviewed ingredient labels");
  return reasons;
}

export function buildPlateRecommendation(
  menu: DiningMenu,
  mealPeriod: MealPeriodId,
  mode: DietMode,
  generatedAt = new Date(),
): PlateRecommendation | null {
  const period = menu.periods.find((candidate) => candidate.id === mealPeriod);
  if (!period) return null;

  const candidates = period.stations
    .flatMap((station) => station.items)
    .filter((item) => item.serving && item.nutrition && item.nutrition.calories > 0)
    .filter((item) => supportsDiet(item, mode));

  const selected: RecommendedItem[] = [];
  const stationIds = new Set<string>();

  for (const role of rolesFor(mode)) {
    const ranked = candidates
      .filter((item) => item.roleCandidates.includes(role))
      .filter((item) => !selected.some((choice) => choice.item.id === item.id))
      .sort((a, b) => {
        const stationBonusA = stationIds.has(a.stationId) ? 5 : 0;
        const stationBonusB = stationIds.has(b.stationId) ? 5 : 0;
        return score(b, mode) + stationBonusB - (score(a, mode) + stationBonusA) || a.sourceOrder - b.sourceOrder || a.id.localeCompare(b.id);
      });
    const choice = ranked.find((item) => stationIds.has(item.stationId) || stationIds.size < 3);
    if (!choice) continue;
    selected.push({
      item: choice,
      servings: 1,
      role,
      action: selected.length === 0 ? "take" : "add",
      reasons: reasonsFor(choice, mode, role),
    });
    stationIds.add(choice.stationId);
  }

  if (selected.length === 0) return null;
  const totals = totalSelections(selected.map(({ item, servings }) => ({ item, servings })));
  const modeName = dietModes.find((candidate) => candidate.id === mode)!.label;
  const completeness = selected.length < rolesFor(mode).length ? " This menu only supports a partial match." : "";

  return {
    mode,
    mealPeriod,
    menuDate: menu.menuDate,
    generatedAt: generatedAt.toISOString(),
    items: selected,
    totals,
    explanation: `${modeName} plate using ${stationIds.size} ${stationIds.size === 1 ? "station" : "stations"}.${completeness}`,
    recommendationVersion: "1.0.0",
  };
}
