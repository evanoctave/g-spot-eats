import type { MealPeriodId } from "@/types/dining";

export const CAMPUS_TIME_ZONE = "America/Los_Angeles";

type CampusParts = {
  date: string;
  weekday: string;
  hour: number;
  minute: number;
};

export function campusParts(at: Date): CampusParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(at).map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: parts.weekday,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

export function campusDate(at: Date): string {
  return campusParts(at).date;
}

export function activeMealPeriod(at: Date): MealPeriodId {
  const { hour } = campusParts(at);
  if (hour < 11) return "breakfast";
  if (hour < 17) return "lunch";
  return "dinner";
}

export function scheduledMealAt(at: Date): MealPeriodId | null {
  const { weekday, hour, minute } = campusParts(at);
  if (minute > 9) return null;
  const weekend = weekday === "Sat" || weekday === "Sun";
  if (hour === (weekend ? 9 : 7)) return "breakfast";
  if (hour === 11) return "lunch";
  if (hour === 17) return "dinner";
  return null;
}

export function formatCampusDate(at: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(at);
}

export function formatCampusTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
