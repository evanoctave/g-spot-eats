# Implementation status

## Working in version 0.1

- Expo Router app shell with Today, Menu, Diary, Settings, and food-detail routes.
- Dynamic sample menu for breakfast, lunch, and dinner grouped by station.
- Deterministic balanced, high-protein, low-carb, high-carb, keto-oriented, vegetarian, vegan, and paleo-oriented plate modes.
- Source-serving selection, whole-serving adjustment, plate totals, and immutable meal logging.
- On-device SQLite persistence on iOS/Android and local storage on web.
- Editable local calorie, protein, carbohydrate, and fat goals.
- America/Los_Angeles date, active-meal, and ingestion-window logic.
- Normalized menu validation and stale/invalid menu protections.
- Supabase schema, guarded ingestion function, read API, release configuration, and operational documentation.
- Automated date, validation, and recommendation tests.

## External release gates

- Obtain and record written authorization for automated access and menu redistribution.
- Implement the authorized provider-specific adapter that converts its documented response to the normalized contract.
- Provision Supabase, apply migrations, deploy functions, configure secrets, and monitor cron runs.
- Choose the final product name and create original App Store icon and screenshots.
- Publish final Privacy Policy and Support URLs with real publisher contact details.
- Test on physical iPhones, Android devices, and TestFlight.
- Complete App Store privacy and content-rights declarations.

Live data cannot be truthfully marked complete until the first two gates are resolved.
