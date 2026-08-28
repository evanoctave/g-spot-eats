# Titan Macros MVP Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement task-by-task. Steps use checkbox syntax.

**Goal:** Build a Gastronome-first Expo app with deterministic preset plate recommendations and immutable local diary snapshots.

**Architecture:** Expo Router routes render testable screens. Client consumes only normalized Titan Macros menu contract through a repository, caches with TanStack Query, then runs a pure local recommendation engine. Until provider permission exists, app uses explicitly labelled fixture data and makes no Dine On Campus request.

**Tech Stack:** Expo 57, React Native 0.86, Expo Router, TypeScript, TanStack Query, Expo SQLite, Jest via jest-expo, React Native Testing Library.

**Spec:** docs/superpowers/specs/2026-08-28-titan-macros-design.md

## Global Constraints

- Use America/Los_Angeles for menu date and meal period.
- Fresh: source fetch at most 15 minutes old and matching campus date.
- Stale: current campus date only. Past or future menu is Invalid.
- Recommendation is pure, deterministic, local, and emits structured reason codes.
- Maximum four items and three stations. Target three items and two stations.
- Preserve source serving. Never infer nutrition, grams, fractional portions, or allergy safety.
- No scraping, vendor credentials, private headers, live relay, or live-data claim until written provider approval.
- Fixture content always visibly says Sample menu.
- Choice-first warm-light UI. No gradients, glassmorphism, or metric-dashboard hero.
- No auth, custom targets, extra venues, progress analytics, or indoor map.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| src/types/nutrition.ts | Macro and source-serving contracts. |
| src/types/dining.ts | Menu, freshness, recommendation, and diary contracts. |
| src/utils/validation.ts | Normalized API contract validator. |
| src/utils/dates.ts | Campus date, active period, freshness. |
| src/utils/macros.ts | Pure role classification, scoring, assembly, totals. |
| src/services/diningRepository.ts | Fixture and normalized API boundary. |
| src/services/menuService.ts | Current menu lookup and validation. |
| src/services/fixtureMenu.ts | Deterministic fixture source. |
| src/hooks/useTodayMenu.ts | Query and foreground refresh. |
| src/lib/localDatabase.ts | Versioned SQLite diary persistence. |
| src/hooks/useDiary.ts | Diary query and log mutation. |
| src/components | Reusable, presentational controls. |
| src/screens | Testable screen composition. |
| app | Router wrappers and navigation. |
| __tests__ | Unit and screen tests. |

### Task 1: Test Foundation and App Configuration

**Files:**
- Modify: package.json
- Modify: app.json
- Create: jest.config.js
- Create: jest.setup.ts
- Create: src/theme/tokens.ts
- Create: __tests__/theme/tokens.test.ts

**Interfaces:** Produces theme token object and npm test command.

- [ ] **Step 1: Install test dependencies and scripts**

Run:

    npx expo install jest-expo @testing-library/react-native
    npm install --save-dev @types/jest
    npm pkg set scripts.test="jest --runInBand"
    npm pkg set scripts.test:watch="jest --watch"

- [ ] **Step 2: Write failing token test**

    import { theme } from "@/theme/tokens";

    it("keeps selection and confirmation colors distinct", () => {
      expect(theme.color.modeSelected).not.toBe(theme.color.confirmation);
      expect(theme.color.text).not.toBe(theme.color.surface);
    });

- [ ] **Step 3: Run failing test**

Run: npm test -- --runTestsByPath __tests__/theme/tokens.test.ts

Expected: FAIL with module-not-found for @/theme/tokens.

- [ ] **Step 4: Implement configuration and tokens**

    // jest.config.js
    module.exports = {
      preset: "jest-expo",
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
    };

    // src/theme/tokens.ts
    export const theme = {
      color: {
        surface: "#F7F4EE",
        elevated: "#FFFDF8",
        text: "#171A1D",
        muted: "#687078",
        divider: "#DDD8CD",
        modeSelected: "#D89113",
        confirmation: "#1F5A3A",
        danger: "#A53D32",
      },
      space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      radius: { sm: 12, md: 18, lg: 26 },
    } as const;

Remove absent root icon, ios.icon, Android adaptive-icon image fields, web.favicon, and splash-image fields from app.json. Retain expo-router, portrait orientation, and typed routes.

- [ ] **Step 5: Verify and commit**

Run: npm test -- --runTestsByPath __tests__/theme/tokens.test.ts

Expected: PASS.

    git add package.json package-lock.json app.json jest.config.js jest.setup.ts src/theme/tokens.ts __tests__/theme/tokens.test.ts
    git commit -m "chore: add Expo test foundation"

### Task 2: Normalized Dining Contract and Validation

**Files:**
- Create: src/types/nutrition.ts
- Create: src/types/dining.ts
- Create: src/utils/validation.ts
- Test: __tests__/utils/validation.test.ts

**Interfaces:** Produces assertNormalizedMenu(value): asserts value is DiningMenu.

- [ ] **Step 1: Write failing validation test**

    import { assertNormalizedMenu } from "@/utils/validation";

    const menu = {
      locationId: "gastronome",
      locationName: "Gastronome",
      menuDate: "2026-08-28",
      freshness: {
        menuDate: "2026-08-28",
        sourceFetchedAt: "2026-08-28T19:00:00.000Z",
        cachedAt: "2026-08-28T19:00:01.000Z",
        sourceStatus: "cached",
        freshness: "fresh",
      },
      periods: [],
    };

    it("accepts normalized menu", () => {
      expect(() => assertNormalizedMenu(menu)).not.toThrow();
    });

    it("rejects malformed contract", () => {
      expect(() => assertNormalizedMenu({ menuDate: 9 })).toThrow("Invalid dining menu");
    });

- [ ] **Step 2: Run failing test**

Run: npm test -- --runTestsByPath __tests__/utils/validation.test.ts

Expected: FAIL with module-not-found for @/utils/validation.

- [ ] **Step 3: Define contracts and validator**

    export type MacroTotals = {
      calories: number;
      proteinGrams: number;
      carbohydratesGrams: number;
      fatGrams: number;
      saturatedFatGrams: number | null;
    };

    export type SourceServing = {
      quantity: number;
      unit: string;
      description?: string;
      grams: number | null;
      multipliable: boolean;
    };

    export type PlateMode = "high_protein" | "high_carb" | "higher_fat" | "balanced";
    export type MealPeriod = "breakfast" | "lunch" | "dinner" | "late_night" | "other";
    export type PlateRole = "protein_anchor" | "carbohydrate" | "produce" | "fat_add_on";

    export type MenuFreshness = {
      menuDate: string;
      sourceFetchedAt: string;
      cachedAt: string;
      sourceStatus: "live" | "cached" | "unavailable";
      freshness: "fresh" | "stale" | "invalid";
    };

    export type DiningStation = {
      id: string;
      name: string;
      sourceOrder: number;
      featuredItemIds: string[];
      items: NormalizedMenuItem[];
    };

    export type DiningPeriod = {
      id: string;
      name: string;
      type: MealPeriod;
      startsAt: string;
      endsAt: string;
      stations: DiningStation[];
    };

    export type NormalizedMenuItem = {
      id: string;
      name: string;
      stationId: string;
      stationName: string;
      menuDate: string;
      sourceOrder: number;
      serving: SourceServing | null;
      macros: MacroTotals | null;
      ingredients: string[] | null;
      sourceDietaryLabels: string[];
      sourceAllergenLabels: string[];
      roleCandidates: PlateRole[];
    };

    export type DiningMenu = {
      locationId: string;
      locationName: string;
      menuDate: string;
      freshness: MenuFreshness;
      periods: DiningPeriod[];
    };

Validator must check root object, required strings, arrays, freshness enums, period structure, station structure, and source item IDs. Throw Error with Invalid dining menu: followed by invalid field.

- [ ] **Step 4: Verify and commit**

Run: npm test -- --runTestsByPath __tests__/utils/validation.test.ts

Expected: PASS.

    git add src/types/nutrition.ts src/types/dining.ts src/utils/validation.ts __tests__/utils/validation.test.ts
    git commit -m "feat: define normalized dining contract"

### Task 3: Campus Time and Current-Menu State

**Files:**
- Create: src/utils/dates.ts
- Create: src/services/fixtureMenu.ts
- Test: __tests__/utils/dates.test.ts

**Interfaces:** Produces campusDate(at), activePeriod(menu, at), and freshnessFor(menu, at).

- [ ] **Step 1: Write failing state tests**

    import { activePeriod, campusDate, freshnessFor } from "@/utils/dates";
    import { makeMenu } from "@/services/fixtureMenu";

    it("uses Los Angeles date for UTC instant", () => {
      expect(campusDate(new Date("2026-08-29T06:30:00.000Z"))).toBe("2026-08-28");
    });

    it("never presents yesterday cache as stale", () => {
      expect(freshnessFor(makeMenu({ menuDate: "2026-08-27" }),
        new Date("2026-08-28T19:00:00.000Z"))).toBe("invalid");
    });

    it("uses provider lunch interval", () => {
      expect(activePeriod(makeMenu(), new Date("2026-08-28T19:30:00.000Z"))?.type).toBe("lunch");
    });

- [ ] **Step 2: Run failing test**

Run: npm test -- --runTestsByPath __tests__/utils/dates.test.ts

Expected: FAIL with module-not-found for @/utils/dates.

- [ ] **Step 3: Implement campus functions and fixture**

Use Intl.DateTimeFormat with America/Los_Angeles, numeric year, two-digit month, and two-digit day. Compare active period ISO instants. Classify Invalid first if menuDate differs from campusDate. Classify Fresh when sourceFetchedAt age is at most 15 minutes, otherwise Stale.

Fixture contains one lunch period, three stations, stable source order, valid source servings, and an optional invalid item.

- [ ] **Step 4: Verify and commit**

Run: npm test -- --runTestsByPath __tests__/utils/dates.test.ts

Expected: PASS.

    git add src/utils/dates.ts src/services/fixtureMenu.ts __tests__/utils/dates.test.ts
    git commit -m "feat: resolve campus menu state"

### Task 4: Role-First Deterministic Recommendation Engine

**Files:**
- Create: src/utils/macros.ts
- Modify: src/types/dining.ts
- Modify: src/services/fixtureMenu.ts
- Test: __tests__/utils/macros.test.ts

**Interfaces:** Produces buildPlateRecommendation(menu, mode, at, version): PlateRecommendation | null.

- [ ] **Step 1: Write failing high-protein and constraint tests**

    import { buildPlateRecommendation } from "@/utils/macros";
    import { makeMenu } from "@/services/fixtureMenu";

    it("selects one protein anchor before complements", () => {
      const result = buildPlateRecommendation(
        makeMenu(), "high_protein", new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );

      expect(result?.items.filter((item) => item.role === "protein_anchor")).toHaveLength(1);
      expect(result?.items[0]).toMatchObject({
        action: "take",
        reasons: expect.arrayContaining(["PROTEIN_ANCHOR", "HIGH_PROTEIN_DENSITY"]),
      });
    });

    it("uses at most three stations and tie breaks by source order", () => {
      const result = buildPlateRecommendation(
        makeMenu({ tieProteinAnchors: true }), "balanced",
        new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );

      expect(new Set(result?.items.map((item) => item.stationId)).size).toBeLessThanOrEqual(3);
      expect(result?.items.find((item) => item.role === "protein_anchor")?.itemId).toBe("chicken-a");
    });

    it("excludes missing source serving or macros", () => {
      const result = buildPlateRecommendation(
        makeMenu({ includeInvalidItem: true }), "high_carb",
        new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );

      expect(result?.items.map((item) => item.itemId)).not.toContain("unknown-macros");
    });

- [ ] **Step 2: Run failing tests**

Run: npm test -- --runTestsByPath __tests__/utils/macros.test.ts

Expected: FAIL with module-not-found for @/utils/macros.

- [ ] **Step 3: Add recommendation contracts**

    export type RecommendationAction = "take" | "add" | "skip";

    export type RecommendationReason =
      | "PROTEIN_ANCHOR"
      | "CARBOHYDRATE_COMPONENT"
      | "PRODUCE_COMPONENT"
      | "FAT_ADD_ON"
      | "HIGH_PROTEIN_DENSITY"
      | "HIGH_CARBOHYDRATE_CONTRIBUTION"
      | "HIGH_FAT_CONTRIBUTION"
      | "LOWER_SATURATED_FAT_PREFERENCE"
      | "FEWER_STATIONS_PREFERENCE"
      | "COMPETING_FEATURED_CHOICE"
      | "PARTIAL_PLATE";

    export type PlateRecommendation = {
      mode: PlateMode;
      mealPeriod: MealPeriod;
      menuDate: string;
      generatedAt: string;
      items: RecommendedItem[];
      totals: MacroTotals;
      explanation: string;
      recommendationVersion: string;
    };

RecommendedItem includes stationId, stationName, itemId, itemName, sourceServing, servings, role, action, reasons, and macros.

- [ ] **Step 4: Implement role-first assembly**

Reject missing serving, missing macros, and calories at or below zero. Use roleCandidates only, no food-name heuristics. Assemble role slots protein_anchor, carbohydrate, produce, fat_add_on. Limit to four items and three stations. Set servings to one source serving.

For equal score, sort station reuse first, then sourceOrder ascending, then itemId ascending.

- [ ] **Step 5: Add failing preset and Skip tests**

    it.each([
      ["high_carb", "HIGH_CARBOHYDRATE_CONTRIBUTION"],
      ["higher_fat", "HIGH_FAT_CONTRIBUTION"],
      ["balanced", "PRODUCE_COMPONENT"],
    ] as const)("returns deterministic %s reasons", (mode, reason) => {
      const first = buildPlateRecommendation(
        makeMenu(), mode, new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );
      const second = buildPlateRecommendation(
        makeMenu(), mode, new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );

      expect(first).toEqual(second);
      expect(first?.items.flatMap((item) => item.reasons)).toContain(reason);
    });

    it("emits skip only for configured featured competitor", () => {
      const result = buildPlateRecommendation(
        makeMenu({ featuredCompetitor: true }), "high_protein",
        new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );

      expect(result?.items.filter((item) => item.action === "skip")).toHaveLength(1);
    });

- [ ] **Step 6: Implement preset scores and Skip**

High protein scores protein per calorie then protein per serving. High carb requires carbohydrate then protein and produce when available. Higher fat scores total fat and subtracts saturated fat only if source value exists. Balanced requires protein and carbohydrate when available, then prefers produce and moderate macro density.

Skip requires featuredItemIds station configuration and score difference at least 25 percent. No featured/default source signal means zero Skip items.

- [ ] **Step 7: Add performance test, verify, and commit**

    it("handles 250 items under 50 ms", () => {
      const start = performance.now();
      buildPlateRecommendation(
        makeMenu({ itemCount: 250 }), "balanced",
        new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      );
      expect(performance.now() - start).toBeLessThan(50);
    });

Run: npm test -- --runTestsByPath __tests__/utils/macros.test.ts

Expected: PASS.

    git add src/types/dining.ts src/utils/macros.ts src/services/fixtureMenu.ts __tests__/utils/macros.test.ts
    git commit -m "feat: add deterministic plate recommendations"

### Task 5: Safe Menu Repository and Query Boundary

**Files:**
- Create: src/services/diningRepository.ts
- Create: src/services/menuService.ts
- Create: src/hooks/useTodayMenu.ts
- Create: docs/data-source-permission.md
- Test: __tests__/services/menuService.test.ts

**Interfaces:** Produces getTodayMenu(at) and useTodayMenu(now).

- [ ] **Step 1: Write failing repository test**

    import { getTodayMenu, setDiningRepositoryForTests } from "@/services/menuService";
    import { makeMenu } from "@/services/fixtureMenu";

    afterEach(() => setDiningRepositoryForTests(null));

    it("returns validated normalized menu", async () => {
      setDiningRepositoryForTests({ getMenu: async () => makeMenu() });
      await expect(getTodayMenu(new Date("2026-08-28T19:30:00.000Z"))).resolves.toMatchObject({
        menu: { locationId: "gastronome", menuDate: "2026-08-28" },
        isDemo: false,
      });
    });

- [ ] **Step 2: Run failing test**

Run: npm test -- --runTestsByPath __tests__/services/menuService.test.ts

Expected: FAIL with module-not-found for @/services/menuService.

- [ ] **Step 3: Implement repository boundary**

    export type DiningRepository = {
      getMenu(input: { locationId: string; menuDate: string }): Promise<unknown>;
    };

    export type TodayMenuResult = {
      menu: DiningMenu;
      isDemo: boolean;
    };

    export class FixtureDiningRepository implements DiningRepository {
      async getMenu(): Promise<unknown> {
        return makeMenu();
      }
    }

menuService validates every repository result with assertNormalizedMenu. Fixture repository is selected only in development or when EXPO_PUBLIC_TITAN_MACROS_DEMO equals true. Result must set isDemo true in fixture mode. No class, constant, URL, or request calls external vendor from client.

- [ ] **Step 4: Add source approval record**

Create docs/data-source-permission.md:

    # Gastronome Data Source Approval

    Provider contact:
    Written approval URL or stored document:
    Approved endpoints:
    Attribution text:
    Rate limit:
    Cache TTL:
    Allowed retention:
    Approved by:
    Approval date:

    Do not add a production relay URL until every field is completed.

- [ ] **Step 5: Implement query hook and verify**

    export function useTodayMenu(now: Date) {
      return useQuery({
        queryKey: ["today-menu", campusDate(now)],
        queryFn: () => getTodayMenu(now),
        staleTime: 15 * 60 * 1000,
      });
    }

Run: npm test -- --runTestsByPath __tests__/services/menuService.test.ts

Expected: PASS.

- [ ] **Step 6: Commit**

    git add src/services/diningRepository.ts src/services/menuService.ts src/hooks/useTodayMenu.ts docs/data-source-permission.md __tests__/services/menuService.test.ts
    git commit -m "feat: add safe normalized menu repository"

### Task 6: Versioned SQLite Diary Snapshot

**Files:**
- Create: src/lib/localDatabase.ts
- Create: src/hooks/useDiary.ts
- Modify: src/types/dining.ts
- Test: __tests__/lib/localDatabase.test.ts

**Interfaces:** Produces createDiaryEntry(recommendation, loggedAt), initializeDatabase(), listDiaryEntries(), and insertDiaryEntry(entry).

- [ ] **Step 1: Write failing snapshot test**

    import { createDiaryEntry } from "@/lib/localDatabase";
    import { buildPlateRecommendation } from "@/utils/macros";
    import { makeMenu } from "@/services/fixtureMenu";

    it("copies recommendation facts into immutable snapshot", () => {
      const recommendation = buildPlateRecommendation(
        makeMenu(), "high_protein", new Date("2026-08-28T19:30:00.000Z"), "1.0.0"
      )!;
      const entry = createDiaryEntry(recommendation, "2026-08-28T20:00:00.000Z");

      expect(entry.items[0]).toEqual(expect.objectContaining({
        sourceItemId: recommendation.items[0].itemId,
        itemName: recommendation.items[0].itemName,
        servingDescription: recommendation.items[0].sourceServing.description,
      }));
    });

- [ ] **Step 2: Run failing test**

Run: npm test -- --runTestsByPath __tests__/lib/localDatabase.test.ts

Expected: FAIL with module-not-found for @/lib/localDatabase.

- [ ] **Step 3: Define snapshot and migration implementation**

    export type DiaryItemSnapshot = {
      sourceItemId: string;
      itemName: string;
      stationName: string;
      servings: number;
      servingDescription: string;
      calories: number;
      proteinGrams: number;
      carbohydratesGrams: number;
      fatGrams: number;
    };

    export type DiaryEntry = {
      id: string;
      mealPeriod: MealPeriod;
      menuDate: string;
      loggedAt: string;
      items: DiaryItemSnapshot[];
      totals: MacroTotals;
      recommendationVersion: string | null;
    };

Use Expo SQLite async API. Migration 1 creates diary_entries and diary_items then sets PRAGMA user_version = 1 in transaction. Read version before migration. Reject version newer than app support. Never serialize current menu object.

- [ ] **Step 4: Add migration test and verify**

Mock Expo SQLite transaction API in jest.setup.ts. Test version 0 creates tables and version 1 reopens without deletion.

Run: npm test -- --runTestsByPath __tests__/lib/localDatabase.test.ts

Expected: PASS.

- [ ] **Step 5: Commit**

    git add src/lib/localDatabase.ts src/hooks/useDiary.ts src/types/dining.ts jest.setup.ts __tests__/lib/localDatabase.test.ts
    git commit -m "feat: persist immutable local diary entries"

### Task 7: Today Screen and Navigation

**Files:**
- Modify: app/_layout.tsx
- Modify: app/(tabs)/_layout.tsx
- Modify: app/(tabs)/index.tsx
- Create: src/screens/TodayScreen.tsx
- Create: src/components/GoalSelector.tsx
- Create: src/components/StationPlan.tsx
- Create: src/components/DataFreshnessBanner.tsx
- Test: __tests__/screens/TodayScreen.test.tsx

**Interfaces:** Produces TodayScreen accepting now: Date and routes Today, My Plate, Diary, Settings.

- [ ] **Step 1: Write failing goal-flow test**

    import { fireEvent } from "@testing-library/react-native";
    import { renderWithClient } from "../testUtils";
    import { TodayScreen } from "@/screens/TodayScreen";

    it("updates guidance after High protein press", async () => {
      const screen = renderWithClient(
        <TodayScreen now={new Date("2026-08-28T19:30:00.000Z")} />
      );

      expect(await screen.findByText("Pick your plate")).toBeTruthy();
      fireEvent.press(screen.getByRole("button", { name: "High protein" }));
      expect(await screen.findByText("Today at Gastronome")).toBeTruthy();
      expect(screen.getByText("Take")).toBeTruthy();
    });

- [ ] **Step 2: Run failing test**

Run: npm test -- --runTestsByPath __tests__/screens/TodayScreen.test.tsx

Expected: FAIL with module-not-found for @/screens/TodayScreen.

- [ ] **Step 3: Implement presentational controls and screen**

GoalSelector has four Pressable controls with accessibilityRole button and accessibilityState selected. StationPlan groups items by station and renders action text. DataFreshnessBanner renders Sample menu for fixture, Last updated for stale, and Today's menu is unavailable. for invalid or error.

    export function TodayScreen({ now }: { now: Date }) {
      const [mode, setMode] = useState<PlateMode>("balanced");
      const menuQuery = useTodayMenu(now);
      const recommendation = menuQuery.data
        ? buildPlateRecommendation(menuQuery.data.menu, mode, now, "1.0.0")
        : null;

      return (
        <SafeAreaView>
          <GoalSelector value={mode} onChange={setMode} />
          <StationPlan recommendation={recommendation} />
        </SafeAreaView>
      );
    }

Root layout wraps router with QueryClientProvider and SafeAreaProvider. Tab labels are Today, My Plate, Diary, Settings.

- [ ] **Step 4: Add state assertions**

    expect(screen.getByText("Sample menu")).toBeTruthy();
    expect(screen.getByText("No complete plate available for this meal.")).toBeTruthy();
    expect(screen.getByText(/Last updated/)).toBeTruthy();
    expect(screen.getByText("Today's menu is unavailable.")).toBeTruthy();

- [ ] **Step 5: Verify and commit**

Run: npm test -- --runTestsByPath __tests__/screens/TodayScreen.test.tsx

Expected: PASS.

    git add app/_layout.tsx "app/(tabs)/_layout.tsx" "app/(tabs)/index.tsx" src/screens/TodayScreen.tsx src/components/GoalSelector.tsx src/components/StationPlan.tsx src/components/DataFreshnessBanner.tsx __tests__/screens/TodayScreen.test.tsx
    git commit -m "feat: add preset plate guidance screen"

### Task 8: My Plate and Food Detail

**Files:**
- Create: app/(tabs)/plate.tsx
- Modify: app/food/[id].tsx
- Create: src/screens/PlateScreen.tsx
- Create: src/screens/FoodDetailScreen.tsx
- Create: src/screens/plateContext.tsx
- Modify: src/components/ServingSelector.tsx
- Modify: src/components/MacroBar.tsx
- Modify: src/components/MacroSummary.tsx
- Test: __tests__/screens/PlateScreen.test.tsx
- Test: __tests__/screens/FoodDetailScreen.test.tsx

**Interfaces:** Consumes RecommendedItem and SourceServing. Produces serving control that allows whole increments only when multipliable.

- [ ] **Step 1: Write failing serving tests**

    it("disables increase for nonmultipliable serving", () => {
      const screen = renderWithClient(
        <ServingSelector
          serving={{ quantity: 1, unit: "ladle", grams: null, multipliable: false }}
          value={1}
          onChange={jest.fn()}
        />
      );

      expect(screen.getByRole("button", { name: "Increase serving" })
        .props.accessibilityState.disabled).toBe(true);
    });

    it("shows source serving without inferred grams", () => {
      const screen = renderWithClient(<FoodDetailScreen item={fixtureItem} />);
      expect(screen.getByText("1 piece (4 oz)")).toBeTruthy();
      expect(screen.queryByText(/estimated grams/i)).toBeNull();
    });

- [ ] **Step 2: Run failing tests**

Run: npm test -- --runTestsByPath __tests__/screens/PlateScreen.test.tsx __tests__/screens/FoodDetailScreen.test.tsx

Expected: FAIL with missing screen or component module.

- [ ] **Step 3: Implement screens and serving control**

ServingSelector accepts SourceServing, value, onChange. Increase works only for multipliable true. Decrease works only above one. FoodDetailScreen shows provider labels plus exact warning:

    Source labels may not reflect substitutions, preparation changes, or cross-contact. Ask dining staff about allergies.

MacroSummary and MacroBar show passed macro totals only. Plate context stores RecommendedItem selections and invokes diary mutation after user logs plan.

- [ ] **Step 4: Verify and commit**

Run: npm test -- --runTestsByPath __tests__/screens/PlateScreen.test.tsx __tests__/screens/FoodDetailScreen.test.tsx

Expected: PASS.

    git add "app/(tabs)/plate.tsx" "app/food/[id].tsx" src/screens/PlateScreen.tsx src/screens/FoodDetailScreen.tsx src/screens/plateContext.tsx src/components/ServingSelector.tsx src/components/MacroBar.tsx src/components/MacroSummary.tsx __tests__/screens/PlateScreen.test.tsx __tests__/screens/FoodDetailScreen.test.tsx
    git commit -m "feat: add plate review and food details"

### Task 9: Diary, Settings, and Foreground Refresh

**Files:**
- Modify: app/(tabs)/diary.tsx
- Modify: app/(tabs)/profile.tsx
- Create: src/screens/DiaryScreen.tsx
- Create: src/screens/SettingsScreen.tsx
- Modify: src/hooks/useTodayMenu.ts
- Modify: src/components/MealSection.tsx
- Test: __tests__/screens/DiaryScreen.test.tsx
- Test: __tests__/screens/SettingsScreen.test.tsx
- Test: __tests__/hooks/useTodayMenu.test.tsx

**Interfaces:** Produces Settings route, snapshot-only diary UI, and foreground query invalidation.

- [ ] **Step 1: Write failing snapshot display test**

    it("renders stored snapshot after source item disappears", async () => {
      mockDiaryEntries([fixtureDiaryEntry]);
      const screen = renderWithClient(<DiaryScreen />);
      expect(await screen.findByText(fixtureDiaryEntry.items[0].itemName)).toBeTruthy();
      expect(screen.getByText(fixtureDiaryEntry.items[0].servingDescription)).toBeTruthy();
    });

- [ ] **Step 2: Run failing test**

Run: npm test -- --runTestsByPath __tests__/screens/DiaryScreen.test.tsx

Expected: FAIL with module-not-found for @/screens/DiaryScreen.

- [ ] **Step 3: Implement Diary and Settings**

MealSection groups DiaryEntry by mealPeriod and renders snapshot fields only. Settings persists default PlateMode in SQLite preferences migration 2. It shows fixture data mode and source approval status, not account fields.

- [ ] **Step 4: Write and implement foreground test**

    it("invalidates today query when app returns to foreground", () => {
      const invalidateQueries = jest.fn();
      mockQueryClient({ invalidateQueries });
      renderHook(() => useTodayMenu(new Date("2026-08-28T19:30:00.000Z")));
      emitAppState("active");
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["today-menu"] });
    });

Subscribe to AppState in cleanup-safe effect. Invalidate only on background or inactive to active transition.

- [ ] **Step 5: Verify and commit**

Run: npm test -- --runTestsByPath __tests__/screens/DiaryScreen.test.tsx __tests__/screens/SettingsScreen.test.tsx __tests__/hooks/useTodayMenu.test.tsx

Expected: PASS.

    git add "app/(tabs)/diary.tsx" "app/(tabs)/profile.tsx" src/screens/DiaryScreen.tsx src/screens/SettingsScreen.tsx src/hooks/useTodayMenu.ts src/components/MealSection.tsx src/lib/localDatabase.ts __tests__/screens/DiaryScreen.test.tsx __tests__/screens/SettingsScreen.test.tsx __tests__/hooks/useTodayMenu.test.tsx
    git commit -m "feat: add diary settings and foreground refresh"

### Task 10: Complete Verification and Source Gate

**Files:**
- Modify: README.md
- Modify: docs/data-source-permission.md
- Create: __tests__/docs/dataSourcePermission.test.ts

**Interfaces:** Produces developer run instructions and documented blocked live-data deployment.

- [ ] **Step 1: Write source-gate documentation test**

    import { readFileSync } from "node:fs";

    it("requires approval before live data", () => {
      const document = readFileSync("docs/data-source-permission.md", "utf8");
      expect(document).toContain("Do not add a production relay URL");
      expect(document).toContain("Approval date:");
    });

- [ ] **Step 2: Run documentation test**

Run: npm test -- --runTestsByPath __tests__/docs/dataSourcePermission.test.ts

Expected: PASS. Failure means restore exact approval fields before continuing.

- [ ] **Step 3: Add README development instructions**

    ## Development

        npm install
        npm test
        npx tsc --noEmit
        npx expo start

    App starts in visibly labelled sample-menu mode. Do not set relay URL or ship live data until docs/data-source-permission.md records provider approval and operating limits.

- [ ] **Step 4: Run full verification**

    npm test -- --runInBand
    npx tsc --noEmit
    npx expo export --platform web

Expected: all tests PASS, type check exits 0, and Expo export writes static web output without missing assets.

- [ ] **Step 5: Inspect UI states**

Run npx expo start --web. Inspect at 320 px and 430 px widths:

1. Every preset selected state.
2. Sample menu banner.
3. Fresh, Stale, Invalid, and unavailable state through fixture overrides.
4. Multipliable and nonmultipliable serving controls.
5. Diary snapshot after source fixture item is removed.

- [ ] **Step 6: Commit**

    git add README.md docs/data-source-permission.md __tests__/docs/dataSourcePermission.test.ts
    git commit -m "docs: define development and source approval gate"

## Plan Self-Review

- Spec coverage: Tasks 2-5 implement normalized contract, Los Angeles time, source validation, permission gate, fixture boundary, deterministic roles, actions, constraints, servings, and tie breakers. Tasks 6 and 9 implement snapshot, SQLite versioning, and foreground transitions. Tasks 7-8 implement visual flow, accessibility, provenance, and allergen warning. Task 10 implements documentation and full verification.
- Intentional boundary: Dine On Campus live relay remains disabled until provider permission exists. This is required source-policy protection.
- Type consistency: MacroTotals and SourceServing originate in Task 2. PlateRecommendation originates in Task 4. Tasks 6 and 8 consume exact contract names.
- Placeholder scan: no unspecified error behavior or unresolved task markers remain.
