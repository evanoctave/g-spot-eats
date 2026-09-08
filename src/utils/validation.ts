import { z } from "zod";

const servingSchema = z.object({
  quantity: z.number().positive(),
  unit: z.string().min(1),
  description: z.string().min(1),
  grams: z.number().positive().nullable(),
  multipliable: z.boolean(),
});

const nutritionSchema = z.object({
  calories: z.number().nonnegative(),
  proteinGrams: z.number().nonnegative(),
  carbohydratesGrams: z.number().nonnegative(),
  fatGrams: z.number().nonnegative(),
  saturatedFatGrams: z.number().nonnegative().nullable(),
  fiberGrams: z.number().nonnegative().nullable(),
  sugarGrams: z.number().nonnegative().nullable(),
  sodiumMilligrams: z.number().nonnegative().nullable(),
});

const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stationId: z.string().min(1),
  stationName: z.string().min(1),
  sourceOrder: z.number().int().nonnegative(),
  serving: servingSchema.nullable(),
  nutrition: nutritionSchema.nullable(),
  ingredients: z.array(z.string()).nullable(),
  dietaryLabels: z.array(z.string()),
  allergenLabels: z.array(z.string()),
  roleCandidates: z.array(
    z.enum(["protein_anchor", "carbohydrate", "produce", "fat_add_on"]),
  ),
  dietTags: z.array(
    z.enum([
      "balanced",
      "high_protein",
      "low_carb",
      "high_carb",
      "keto_oriented",
      "vegetarian",
      "vegan",
      "paleo_oriented",
    ]),
  ),
});

export const diningMenuSchema = z.object({
  locationId: z.literal("gastronome"),
  locationName: z.string().min(1),
  menuDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  freshness: z.object({
    menuDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sourceFetchedAt: z.string().datetime(),
    cachedAt: z.string().datetime(),
    sourceStatus: z.enum(["live", "cached", "fixture"]),
    freshness: z.enum(["fresh", "stale", "invalid"]),
  }),
  periods: z.array(
    z.object({
      id: z.enum(["breakfast", "lunch", "dinner"]),
      name: z.string().min(1),
      startsAt: z.string().regex(/^\d{2}:\d{2}$/),
      endsAt: z.string().regex(/^\d{2}:\d{2}$/),
      stations: z.array(
        z.object({ id: z.string().min(1), name: z.string().min(1), items: z.array(menuItemSchema) }),
      ),
    }),
  ),
});

export type ValidatedDiningMenu = z.infer<typeof diningMenuSchema>;

export function assertNormalizedMenu(value: unknown): asserts value is ValidatedDiningMenu {
  diningMenuSchema.parse(value);
}
