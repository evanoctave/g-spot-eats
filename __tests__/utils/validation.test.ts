import { describe, expect, it } from "vitest";
import { makeFixtureMenu } from "@/services/fixtureMenu";
import { assertNormalizedMenu } from "@/utils/validation";

describe("normalized menu validation", () => {
  it("accepts the canonical fixture", () => {
    expect(() => assertNormalizedMenu(makeFixtureMenu("2026-09-03"))).not.toThrow();
  });
  it("rejects malformed nutrition before it reaches the app", () => {
    const menu = makeFixtureMenu("2026-09-03") as any;
    menu.periods[0].stations[0].items[0].nutrition.calories = -10;
    expect(() => assertNormalizedMenu(menu)).toThrow();
  });
});
