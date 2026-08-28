# Titan Macros, Gastronome MVP Design

## North Star

Titan Macros turns today's Gastronome menu into a short, actionable plate plan based on what a CSUF student wants more of. Recommendation and station wayfinding are core product. Local food logging is secondary.

Primary user: student between classes. Success: pick a preset, visit few relevant stations, and know what to take or optionally add without doing macro math or scanning whole dining hall.

## Scope

Production-quality mobile MVP supports only Gastronome.

- Today: active meal period, preset selector, current station recommendations, freshness, and unavailable state.
- My Plate: selected source servings, macro totals, and local diary action.
- Food detail: source-provided nutrition and serving information, ingredients, and source dietary or allergen labels when available.
- Diary: immutable local meal-entry snapshots grouped by meal period.
- Settings: default plate mode, dietary display preferences, app information, and data-source state. No Profile in v1 because no account exists.

Excluded:

- Custom macro targets, sign-in, cloud sync, social features, and progress analytics.
- Venues beyond Gastronome.
- Unverified indoor turn-by-turn map. App names next station until validated station geometry exists.
- Any inference of safe foods for allergies, dietary restrictions, or medical needs.

## Design Direction

Use visual probe B: choice-first, then station recommendations.

- Color: restrained light surface. Warm off-white, ink text, marigold selected mode, forest-green confirmed choices.
- Physical scene: student checks phone in bright Southern California midday light while walking into Gastronome between classes. High contrast and quick scanning matter more than decorative density.
- References: Cal AI for fast nutrition flow; Apple Reminders for action clarity; campus wayfinding signage for concise destination language.
- Structure: large goal picker, one flat recommendation surface separated by dividers, persistent plate action. No metric-dashboard hero, glassmorphism, gradients, or repeated nested cards.

## User Flow

1. Today resolves campus-local current date and active source meal period.
2. Student selects High protein, High carb, Higher fat, or Balanced.
3. App renders short plan: Go to X -> Take Y -> Add Z.
4. Student opens an item for source-provided facts or adds an allowed serving to My Plate.
5. My Plate shows totals and logs immutable snapshot to Diary.
6. Today re-evaluates when app returns to foreground and whenever campus day or meal period changes.

## Time, Meal Period, and Freshness

All date and meal-period logic runs in America/Los_Angeles. Phone timezone never controls Gastronome state.

Provider period list is authoritative. Configured fallback windows exist only when source omits periods.

    type MenuFreshness = {
      menuDate: string; // YYYY-MM-DD, America/Los_Angeles
      sourceFetchedAt: string; // successful upstream retrieval, ISO 8601
      cachedAt: string; // relay cache write, ISO 8601
      sourceStatus: "live" | "cached" | "unavailable";
      freshness: "fresh" | "stale" | "invalid";
    };

- Fresh: successful source fetch is no more than 15 minutes old and menuDate equals current campus date.
- Stale: cached response is older than 15 minutes but menuDate still equals current campus date. UI shows retrieval time and refresh action.
- Invalid: menuDate is not current campus date, expected current period is absent, or source validation fails. Invalid menu never renders as today's menu.
- Offline: Today may render only current-date Fresh or Stale cache. Refresh never blocks cached recommendation.

At meal transition, existing My Plate selection remains intact. Today re-runs for new period. Lunch selections never become dinner recommendations.

## Vendor Dependency and Data Policy

Production relay requires written permission or approved API agreement from Gastronome dining provider covering relay, cache, recommendation, and redisplay. Dine On Campus endpoints appear publicly callable but are not documented public integration contract; direct development requests have returned 403.

Compass Group terms found during research limit copying and distribution of site content to permitted use. This needs direct provider confirmation before live feature ships.

Until permission gate clears, development uses provider-shaped fixtures only. Live relay stays unavailable. Provider credentials, private headers, and configuration never ship in mobile bundle.

After approval:

- Retain source attribution as provider requires.
- Respect rate limits, cache-control, and permitted retention.
- Keep vendor secrets only in Edge Function secrets.
- Log relay operations without diary content or user identifiers.

Policy source requiring provider review: [Compass Group terms of use](https://campusdining.compass-usa.com/demotwo/Pages/Privacy-Statement.aspx).

## Data Architecture

Normalization happens server-side. Mobile app consumes only Titan Macros normalized API contract. Vendor schema changes then need relay change, not App Store release.

    Dine On Campus
          |
          v
    Supabase Edge Function
      - vendor adapter
      - schema validation
      - normalization
      - cache and freshness policy
          |
          v
    Normalized Dining API
          |
          v
    TanStack Query / Expo client cache
          |
          v
    Deterministic recommendation engine
          |
          v
    UI

Relay accepts new source response only after strict validation and normalization. Unknown, malformed, or partial response cannot overwrite last valid cache.

Contract and fixture tests cover known upstream location, period, menu, nutrition, serving, and attribution response shapes. Required structure change, invalid type, missing stable ID, or malformed nutrition triggers loud error and preserves valid current-date cache.

## Normalized Dining Contract

    type MacroTotals = {
      calories: number;
      proteinGrams: number;
      carbohydratesGrams: number;
      fatGrams: number;
      saturatedFatGrams: number | null;
    };

    type SourceServing = {
      quantity: number;
      unit: string;
      description?: string;
      grams: number | null;
      multipliable: boolean;
    };

    type NormalizedMenuItem = {
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

SourceServing preserves provider words. It never converts to grams unless source provides grams.

Default serving is one source serving. Multiplication exists only when normalized source metadata marks positive numeric serving multipliable. It uses whole source-serving increments only. App never creates fractional, estimated, or inferred portions.

Item without stable ID, valid source serving, or complete core macros cannot receive recommendation. It can appear in raw menu with Nutrition unavailable label. Titan Macros never infers nutrition.

## Recommendation Contract

Recommendation engine is pure and deterministic. Same valid normalized current menu, mode, period, configuration, and recommendationVersion always returns same result.

    type PlateMode = "high_protein" | "high_carb" | "higher_fat" | "balanced";
    type MealPeriod = "breakfast" | "lunch" | "dinner" | "late_night" | "other";
    type PlateRole = "protein_anchor" | "carbohydrate" | "produce" | "fat_add_on";
    type RecommendationAction = "take" | "add" | "skip";

    type RecommendationReason =
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

    type RecommendedItem = {
      stationId: string;
      stationName: string;
      itemId: string;
      itemName: string;
      sourceServing: SourceServing;
      servings: number;
      role: PlateRole;
      action: RecommendationAction;
      reasons: RecommendationReason[];
      macros: MacroTotals;
    };

    type PlateRecommendation = {
      mode: PlateMode;
      mealPeriod: MealPeriod;
      menuDate: string;
      generatedAt: string;
      items: RecommendedItem[];
      totals: MacroTotals;
      explanation: string;
      recommendationVersion: string;
    };

Engine emits reason codes. Presentation maps codes to copy. UI never invents recommendation rationale. Engine generates explanation from selected role and reason codes.

Action definitions:

- Take: required primary component of generated plate. Valid plate has one or more Take items.
- Add: optional complementary component. Complete plate can omit Add items.
- Skip: never generic undesirable-food list. Engine may produce Skip only when station configuration explicitly marks a competing item as source-featured or default and that choice materially conflicts with mode. No reliable featured/default signal means no Skip result.

## Plate Assembly and Scoring

Engine assigns plate roles before scoring. It never chooses globally top macro scores.

1. Filter to current-date items with valid ID, station, source serving, and core macros.
2. Assign protein_anchor, carbohydrate, produce, and fat_add_on candidates from deterministic provider-category and provider-tag mapping. Name heuristics are forbidden in MVP. Unclassified item remains raw-menu only.
3. Build role slots, then score candidates within each slot.
4. Assemble plate under station, role, duplicate, and serving constraints.
5. Emit Skip only from configured featured/default competitor metadata.

Preset rules:

- High protein: require protein anchor when available. Score protein per calorie, then protein per source serving. Add produce or carbohydrate only when it improves completeness without displacing anchor.
- High carb: require carbohydrate when available. Keep protein anchor when available. Prefer produce as complement.
- Higher fat: prioritize higher fat contribution. If saturated-fat source data exists, penalize excessive saturated fat. Do not claim unsaturated-fat detection or healthy fats. UI subtitle: More fat-forward choices while keeping a complete plate.
- Balanced: require protein anchor and carbohydrate when both exist; prefer one produce item; include fat add-on only when useful; favor moderate macro density; minimize duplicate roles.

Constraints:

- Maximum recommendation items: four. Target three or fewer.
- Maximum stations: three. Target two or fewer.
- Never recommend same item twice or two items for same required role.
- Prefer existing station where candidates are within five percent score. Otherwise select higher score.
- Never invent serving or nutrition.
- If required role absent, emit best partial plate with PARTIAL_PLATE reason and explanation. If no valid candidate exists, return no recommendation.
- Equal scores break by fewer station changes, then provider sourceOrder, then itemId ascending.

## Diary Contract and Local Persistence

Diary entry never depends on mutable current-menu object. Logging snapshots current facts.

    type DiaryItemSnapshot = {
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

    type DiaryEntry = {
      id: string;
      mealPeriod: MealPeriod;
      menuDate: string;
      loggedAt: string;
      items: DiaryItemSnapshot[];
      totals: MacroTotals;
      recommendationVersion: string | null;
    };

SQLite schema version starts at first release. Each migration is forward-only, transactional, and tested against pre-migration diary fixture. Migrations preserve existing entries.

## Allergens and Dietary Labels

Allergen and dietary labels reproduce source data. They may not account for substitutions, preparation changes, or cross-contact. Titan Macros does not decide whether food is safe for allergy. App never infers allergen-free status from ingredients, absence of labels, or recipes.

## Observability and Performance

Relay logs source request failures, cache hits, normalization failures, source schema version, and response latency. It logs no diary contents or user-identifying analytics.

- Cached Today data renders immediately from TanStack Query cache.
- Network refresh does not block current-date cached recommendation.
- Recommendation engine runs locally from normalized data. Fixture budget: under 50 ms for 250 menu items.

## Validation Fixtures and Tests

- Contract fixtures: source locations, periods, categories, menu items, source servings, nutrition, and attribution.
- Invalid upstream: malformed structures, unknown required fields, duplicate IDs, missing servings, null macros, and errors.
- Bad-but-valid: calories 0, duplicate item across stations, no produce, no protein anchor, nutritionless-only station, future menuDate, and past menuDate.
- Recommendation: four modes, roles before scoring, max items, max stations, no duplicate role, source-serving rule, Skip rule, partial plate, and deterministic tie breakers.
- UI: selected goal, foreground meal transition, Fresh, Stale, Invalid, offline, no recommendation, unavailable source, and diary snapshot.
- Integration: TypeScript type check and Expo build.

## Delivery Priority

1. Approved vendor data access, normalized contract, current-menu detection, fixture source.
2. Role classification, preset scoring, plate assembly, and deterministic contract.
3. Today UI: Go to X -> Take Y -> Add Z, including freshness states.
4. My Plate and immutable local diary snapshots.
5. Settings and food-detail polish.

