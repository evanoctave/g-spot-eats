import { describe, expect, it } from "vitest";
import { makeFixtureMenu } from "@/services/fixtureMenu";
import { buildPlateRecommendation } from "@/utils/macros";

describe("plate recommendations", () => {
  const menu = makeFixtureMenu("2026-09-03");
  it.each(["balanced", "high_protein", "low_carb", "high_carb", "keto_oriented", "vegetarian", "vegan", "paleo_oriented"] as const)("builds a deterministic %s plate", (mode) => {
    const at = new Date("2026-09-03T19:00:00.000Z");
    const first = buildPlateRecommendation(menu, "lunch", mode, at);
    const second = buildPlateRecommendation(menu, "lunch", mode, at);
    expect(first).toEqual(second);
    expect(first?.items.length).toBeGreaterThan(0);
    expect(first?.items.length).toBeLessThanOrEqual(4);
    expect(new Set(first?.items.map(({ item }) => item.stationId)).size).toBeLessThanOrEqual(3);
  });
  it("does not recommend nutritionless foods", () => {
    menu.periods[1].stations[0].items[0].nutrition = null;
    const result = buildPlateRecommendation(menu, "lunch", "high_protein", new Date("2026-09-03T19:00:00.000Z"));
    expect(result?.items.every(({ item }) => item.nutrition !== null)).toBe(true);
  });
});
