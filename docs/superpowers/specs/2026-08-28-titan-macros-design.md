# Titan Macros, Gastronome MVP Design

## Purpose

Titan Macros helps CSUF students choose a useful meal at the Gastronome before
walking around the dining hall. The app turns today's menu and nutrition data
into explicit station-by-station plate instructions for one of four preset
goals: High protein, High carb, Higher fat, or Balanced.

The primary user is a student between classes with little time to inspect every
station. Success means they can choose a preset, identify their next station,
and understand what to take, add, or skip without doing macro math themselves.

## Scope

This production-quality mobile MVP supports only the Gastronome. It includes:

- Today: goal selection, current menu recommendations by station, and stale
  menu state.
- My Plate: chosen foods, serving selection, macro summary, and diary action.
- Food detail: verified nutrition, serving information, ingredients, and
  allergen information when source data supplies it.
- Diary: meals logged locally, grouped by meal period.
- Profile: selected defaults and data freshness information.

Excluded from this MVP:

- Custom macro targets.
- Sign-in, cloud diary sync, social features, and progress history.
- Venues beyond the Gastronome.
- Unverified indoor turn-by-turn routes. The app directs users to a named
  dining station; a visual indoor map waits for validated station geometry.

## Design Direction

Direction uses visual probe B: choice-first, then station recommendations.

- Color strategy: restrained light surface. Warm off-white base, ink text,
  marigold for selected plate mode, and forest green for confirmed picks.
- Physical scene: a student checks their phone in bright Southern California
  midday light while walking into the Gastronome between classes, so contrast
  and quick scanning matter more than decorative density.
- References: Cal AI for fast nutrition flow; Apple Reminders for action
  clarity; campus wayfinding signage for concise destination language.
- Structure: large goal picker, one flat recommendations surface separated by
  dividers, persistent plate action. No metric-dashboard hero, visual
  glassmorphism, gradients, or repetitive nested cards.

## User Flow

1. Today opens with current meal period and four preset plate modes.
2. Student picks a mode.
3. App filters and ranks only current Gastronome menu items with usable
   nutrition. It shows each useful station and clear Take, Add, or Skip rows.
4. Student opens a food for nutrition details or adds it with a serving amount.
5. My Plate shows macro totals and allows logging the selection to Diary.
6. Diary keeps local meal history. Profile exposes defaults and data state.

## Data Design

The app owns a normalized dining data model. UI never parses vendor responses.

```text
Dine On Campus source
  -> server relay and cache
  -> normalized menu/nutrition response
  -> Expo query cache
  -> recommendation engine and UI
```

The Dine On Campus API adapter obtains locations, meal periods, menu categories,
items, and available nutrition data. A Supabase Edge relay is the boundary to
the upstream vendor: it reduces mobile-client coupling, permits cache control,
and returns the last verified response when upstream fails. The relay must store
a freshness timestamp and source response status.

App behavior for source failures:

- Fresh cached response: use it normally.
- Stale cached response: show data with a clear "Last updated" label.
- No cached response: show an actionable unavailable state and source link.
- Missing nutrition: keep menu item visible but exclude it from macro ranking;
  label it as unavailable for macro guidance.

The local diary uses SQLite and remains usable offline. Authentication and cloud
sync are intentionally deferred.

## Recommendation Rules

Preset plate modes are explanations, not custom user goals:

- High protein prioritizes protein per calorie, then protein per serving.
- High carb prioritizes carbohydrate-rich choices while retaining a protein
  anchor and vegetables when available.
- Higher fat prioritizes unsaturated-fat-forward options and avoids claiming
  medical suitability.
- Balanced pairs protein, carb, fat, and vegetables into a practical plate.

Recommendations require nutrition facts and avoid false precision. Each result
contains a station, item, serving instruction, macro contribution, and one of
Take, Add, or Skip. Source dietary and allergen flags remain visible but do not
replace professional allergy guidance.

## Components and Boundaries

- `dineOnCampus` source adapter: vendor requests and response parsing only.
- `menuService`: normalized data retrieval, query caching, freshness policy.
- `recommendations`: deterministic preset scoring and plate assembly.
- `localDatabase` and `useDiary`: persistent local diary only.
- Screens: compose hooks and present states; never hold source parsing or
  ranking logic.
- Shared components: goal picker, station recommendation, food card, serving
  selector, macro summary, and meal section.

## States and Accessibility

Every data screen has loading, available, empty, stale, and unavailable states.
Goal controls expose selected state and remain usable by screen reader and
keyboard. Text and actions meet WCAG AA contrast. Serving controls support
increment and decrement actions with accessible labels. Visible dietary or
allergen source tags are informational only.

## Validation

- Unit tests cover upstream normalization, missing nutrition, and source error
  handling.
- Unit tests cover each preset's ranking and balanced plate composition using
  fixtures.
- UI tests verify selected goal state, empty menu, stale source, unavailable
  source, and serving-to-diary flow.
- Type checking and Expo build verify integration.

