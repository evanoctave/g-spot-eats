import type { DiningMenu, DiningPeriod, DietMode, MenuItem, PlateRole } from "@/types/dining";
import type { NutritionFacts } from "@/types/nutrition";

type ItemInput = {
  id: string;
  name: string;
  station: [string, string];
  serving: string;
  nutrition: [number, number, number, number];
  roles: PlateRole[];
  tags?: DietMode[];
  labels?: string[];
  allergens?: string[];
  ingredients?: string[];
};

function food(input: ItemInput, sourceOrder: number): MenuItem {
  const [calories, proteinGrams, carbohydratesGrams, fatGrams] = input.nutrition;
  const nutrition: NutritionFacts = {
    calories,
    proteinGrams,
    carbohydratesGrams,
    fatGrams,
    saturatedFatGrams: null,
    fiberGrams: null,
    sugarGrams: null,
    sodiumMilligrams: null,
  };
  return {
    id: input.id,
    name: input.name,
    stationId: input.station[0],
    stationName: input.station[1],
    sourceOrder,
    serving: {
      quantity: 1,
      unit: "serving",
      description: input.serving,
      grams: null,
      multipliable: true,
    },
    nutrition,
    ingredients: input.ingredients ?? null,
    dietaryLabels: input.labels ?? [],
    allergenLabels: input.allergens ?? [],
    roleCandidates: input.roles,
    dietTags: ["balanced", ...(input.tags ?? [])],
  };
}

function period(
  id: DiningPeriod["id"],
  name: string,
  startsAt: string,
  endsAt: string,
  inputs: ItemInput[],
): DiningPeriod {
  const items = inputs.map(food);
  const stationMap = new Map<string, { id: string; name: string; items: MenuItem[] }>();
  for (const item of items) {
    const station = stationMap.get(item.stationId) ?? {
      id: item.stationId,
      name: item.stationName,
      items: [],
    };
    station.items.push(item);
    stationMap.set(item.stationId, station);
  }
  return { id, name, startsAt, endsAt, stations: [...stationMap.values()] };
}

export function makeFixtureMenu(menuDate: string): DiningMenu {
  const fetchedAt = new Date().toISOString();
  const grill: [string, string] = ["grill", "The Grill"];
  const kitchen: [string, string] = ["kitchen", "Chef's Table"];
  const garden: [string, string] = ["garden", "Garden Bar"];
  const hearth: [string, string] = ["hearth", "Hearth"];

  return {
    locationId: "gastronome",
    locationName: "The Gastronome",
    menuDate,
    sourceName: "Sample menu modeled on dining-hall nutrition listings",
    sourceUrl: "https://dineoncampus.com/csuf/whats-on-the-menu",
    freshness: {
      menuDate,
      sourceFetchedAt: fetchedAt,
      cachedAt: fetchedAt,
      sourceStatus: "fixture",
      freshness: "fresh",
    },
    periods: [
      period("breakfast", "Breakfast", "07:00", "11:00", [
        { id: "b-eggs", name: "Scrambled Eggs", station: grill, serving: "2 eggs", nutrition: [180, 13, 2, 13], roles: ["protein_anchor", "fat_add_on"], tags: ["high_protein", "low_carb", "keto_oriented", "vegetarian"], labels: ["Vegetarian"], allergens: ["Egg", "Milk"], ingredients: ["Eggs", "milk", "salt"] },
        { id: "b-turkey", name: "Turkey Sausage", station: grill, serving: "2 links", nutrition: [140, 14, 3, 8], roles: ["protein_anchor"], tags: ["high_protein", "low_carb", "keto_oriented", "paleo_oriented"], allergens: [], ingredients: ["Turkey", "spices"] },
        { id: "b-oats", name: "Steel-Cut Oatmeal", station: kitchen, serving: "1 cup", nutrition: [170, 6, 31, 3], roles: ["carbohydrate"], tags: ["high_carb", "vegetarian", "vegan"], labels: ["Vegan"], allergens: ["Wheat"], ingredients: ["Oats", "water"] },
        { id: "b-potatoes", name: "Breakfast Potatoes", station: hearth, serving: "4 oz", nutrition: [160, 3, 27, 5], roles: ["carbohydrate"], tags: ["high_carb", "vegetarian", "vegan", "paleo_oriented"], labels: ["Vegan"], ingredients: ["Potatoes", "canola oil", "seasoning"] },
        { id: "b-fruit", name: "Fresh Melon", station: garden, serving: "1 cup", nutrition: [60, 1, 15, 0], roles: ["produce", "carbohydrate"], tags: ["high_carb", "vegetarian", "vegan", "paleo_oriented"], labels: ["Vegan"], ingredients: ["Seasonal melon"] },
      ]),
      period("lunch", "Lunch", "11:00", "17:00", [
        { id: "l-chicken", name: "Herb Grilled Chicken", station: grill, serving: "4 oz", nutrition: [190, 35, 2, 5], roles: ["protein_anchor"], tags: ["high_protein", "low_carb", "keto_oriented", "paleo_oriented"], allergens: [], ingredients: ["Chicken breast", "herbs", "olive oil"] },
        { id: "l-tofu", name: "Ginger Baked Tofu", station: kitchen, serving: "4 oz", nutrition: [170, 16, 8, 9], roles: ["protein_anchor", "fat_add_on"], tags: ["high_protein", "low_carb", "vegetarian", "vegan"], labels: ["Vegan"], allergens: ["Soy"], ingredients: ["Tofu", "ginger", "tamari"] },
        { id: "l-rice", name: "Steamed Brown Rice", station: kitchen, serving: "1 cup", nutrition: [215, 5, 45, 2], roles: ["carbohydrate"], tags: ["high_carb", "vegetarian", "vegan"], labels: ["Vegan"], ingredients: ["Brown rice", "water"] },
        { id: "l-broccoli", name: "Roasted Broccoli", station: garden, serving: "1 cup", nutrition: [80, 4, 11, 3], roles: ["produce"], tags: ["low_carb", "keto_oriented", "vegetarian", "vegan", "paleo_oriented"], labels: ["Vegan"], ingredients: ["Broccoli", "olive oil", "salt"] },
        { id: "l-avocado", name: "Sliced Avocado", station: garden, serving: "1/2 avocado", nutrition: [120, 2, 6, 11], roles: ["fat_add_on", "produce"], tags: ["low_carb", "keto_oriented", "vegetarian", "vegan", "paleo_oriented"], labels: ["Vegan"], ingredients: ["Avocado"] },
        { id: "l-pasta", name: "Penne Marinara", station: hearth, serving: "1 cup", nutrition: [320, 11, 58, 6], roles: ["carbohydrate"], tags: ["high_carb", "vegetarian", "vegan"], labels: ["Vegan"], allergens: ["Wheat"], ingredients: ["Wheat pasta", "tomato", "garlic"] },
      ]),
      period("dinner", "Dinner", "17:00", "21:00", [
        { id: "d-salmon", name: "Lemon Roasted Salmon", station: grill, serving: "4 oz", nutrition: [240, 30, 1, 13], roles: ["protein_anchor", "fat_add_on"], tags: ["high_protein", "low_carb", "keto_oriented", "paleo_oriented"], allergens: ["Fish"], ingredients: ["Salmon", "lemon", "olive oil"] },
        { id: "d-lentils", name: "Braised Lentils", station: kitchen, serving: "1 cup", nutrition: [230, 18, 40, 2], roles: ["protein_anchor", "carbohydrate"], tags: ["high_protein", "high_carb", "vegetarian", "vegan"], labels: ["Vegan"], ingredients: ["Lentils", "vegetable stock", "herbs"] },
        { id: "d-sweet-potato", name: "Roasted Sweet Potato", station: hearth, serving: "1 medium potato", nutrition: [180, 4, 41, 0], roles: ["carbohydrate", "produce"], tags: ["high_carb", "vegetarian", "vegan", "paleo_oriented"], labels: ["Vegan"], ingredients: ["Sweet potato"] },
        { id: "d-greens", name: "Garlic Sautéed Greens", station: garden, serving: "1 cup", nutrition: [90, 5, 10, 4], roles: ["produce"], tags: ["low_carb", "keto_oriented", "vegetarian", "vegan", "paleo_oriented"], labels: ["Vegan"], ingredients: ["Seasonal greens", "garlic", "olive oil"] },
        { id: "d-quinoa", name: "Herbed Quinoa", station: kitchen, serving: "1 cup", nutrition: [220, 8, 39, 4], roles: ["carbohydrate"], tags: ["high_carb", "vegetarian", "vegan"], labels: ["Vegan"], ingredients: ["Quinoa", "herbs"] },
      ]),
    ],
  };
}
