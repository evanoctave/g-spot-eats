# App Store release checklist

- Choose final original name and commission original icon artwork.
- Enroll the publishing entity in the Apple Developer Program.
- Host public Support and Privacy Policy URLs.
- Complete App Store privacy disclosures for local nutrition-diary data and every SDK.
- Keep the non-affiliation statement visible in Settings and store metadata.
- Retain written authorization for third-party menu content; Apple may request it.
- Configure the Supabase project, migrations, functions, secrets, and monitored cron job.
- Set `EXPO_PUBLIC_MENU_API_URL` in the production EAS environment.
- Test fresh, stale, invalid, offline, empty-menu, and meal-transition states on physical iPhones.
- Add a final 1024×1024 icon and required screenshots.
- Run `npm test`, `npm run typecheck`, `npm run lint`, and `npx expo export --platform web`.
- Create a preview build, distribute through TestFlight, and resolve tester feedback.
- Build with `eas build --platform ios --profile production`.
- Submit with `eas submit --platform ios --profile production`.
