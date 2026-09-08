# GSpot Eats

An independent CSUF dining-hall menu, macro tracker, and deterministic plate planner built with Expo. The app is not affiliated with or endorsed by California State University, Fullerton, Chartwells, Compass Group, or Dine On Campus.

## Current mode

The app runs with a visibly labeled sample menu. Live ingestion is gated until written permission and an approved provider contract are recorded in `docs/data-source-permission.md`.

## Development

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run web
```

Run on a device with `npm run ios` or `npm run android`. Set `EXPO_PUBLIC_MENU_API_URL` only when the deployed normalized menu API is available.

## Product flows

- Today: choose a diet direction and build a feasible plate from the active meal.
- Menu: browse breakfast, lunch, and dinner by station and add source servings.
- Diary: log immutable on-device meal snapshots and compare daily totals with personal targets.
- Settings: set local goals, review data-source status, and open the official menu.

## Data architecture

Supabase Cron invokes a guarded Edge Function. The function performs a source request only inside the configured Los Angeles meal window, validates the normalized response, and stores a versioned snapshot. The app reads through the public `menu-api` function and never scrapes from a phone.

See `supabase/README.md` and `docs/data-source-permission.md`.

## Safety

Nutrition, ingredients, and serving sizes may change in actual preparation. Diet modes are planning aids, not medical advice, and never infer allergy safety from missing labels.
