import { describe, expect, it } from "vitest";
import { activeMealPeriod, campusDate, scheduledMealAt } from "@/utils/dates";

describe("campus time", () => {
  it("uses America/Los_Angeles instead of the device timezone", () => {
    expect(campusDate(new Date("2026-09-04T06:30:00.000Z"))).toBe("2026-09-03");
  });
  it("selects the active meal from campus time", () => {
    expect(activeMealPeriod(new Date("2026-09-03T18:30:00.000Z"))).toBe("lunch");
    expect(activeMealPeriod(new Date("2026-09-04T00:30:00.000Z"))).toBe("dinner");
  });
  it("recognizes weekday and weekend ingestion windows", () => {
    expect(scheduledMealAt(new Date("2026-09-04T14:05:00.000Z"))).toBe("breakfast");
    expect(scheduledMealAt(new Date("2026-09-05T16:05:00.000Z"))).toBe("breakfast");
    expect(scheduledMealAt(new Date("2026-09-05T18:05:00.000Z"))).toBe("lunch");
    expect(scheduledMealAt(new Date("2026-09-06T00:05:00.000Z"))).toBe("dinner");
  });
});
