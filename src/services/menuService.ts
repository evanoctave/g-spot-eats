import type { DiningMenu, MenuItem } from "@/types/dining";
import { campusDate } from "@/utils/dates";
import { assertNormalizedMenu } from "@/utils/validation";
import { makeFixtureMenu } from "./fixtureMenu";

export type TodayMenuResult = { menu: DiningMenu; isDemo: boolean };

export interface DiningRepository {
  getMenu(input: { locationId: "gastronome"; menuDate: string }): Promise<unknown>;
}

class FixtureDiningRepository implements DiningRepository {
  async getMenu(input: { locationId: "gastronome"; menuDate: string }) {
    return makeFixtureMenu(input.menuDate);
  }
}

class NormalizedApiRepository implements DiningRepository {
  constructor(private readonly baseUrl: string) {}

  async getMenu(input: { locationId: "gastronome"; menuDate: string }) {
    const url = new URL(this.baseUrl);
    url.searchParams.set("location", input.locationId);
    url.searchParams.set("date", input.menuDate);
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Menu service returned ${response.status}`);
    return response.json();
  }
}

let repositoryOverride: DiningRepository | null = null;

export function setDiningRepositoryForTests(repository: DiningRepository | null) {
  repositoryOverride = repository;
}

export async function getTodayMenu(at = new Date()): Promise<TodayMenuResult> {
  const menuDate = campusDate(at);
  const apiUrl = process.env.EXPO_PUBLIC_MENU_API_URL;
  const isDemo = !apiUrl;
  const repository = repositoryOverride ?? (apiUrl ? new NormalizedApiRepository(apiUrl) : new FixtureDiningRepository());
  const value = await repository.getMenu({ locationId: "gastronome", menuDate });
  assertNormalizedMenu(value);
  if (value.menuDate !== menuDate || value.freshness.menuDate !== menuDate) {
    throw new Error("The menu service did not return the current campus date.");
  }
  return { menu: value as DiningMenu, isDemo };
}

export function findMenuItem(menu: DiningMenu, id: string): MenuItem | null {
  return menu.periods.flatMap((period) => period.stations).flatMap((station) => station.items).find((item) => item.id === id) ?? null;
}
