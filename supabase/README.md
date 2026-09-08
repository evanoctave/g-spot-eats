# Scheduled menu ingestion

The backend stores only validated, normalized menu snapshots. It never exposes provider credentials to the mobile bundle.

## Required secrets

- `DATA_SOURCE_APPROVED=true` only after `docs/data-source-permission.md` is complete.
- `AUTHORIZED_MENU_URL_TEMPLATE` points to an approved adapter that returns the normalized app contract and accepts `{date}` and `{period}` placeholders.
- `INGESTION_CRON_SECRET` is shared only by the cron invocation and ingestion function.

Deploy `ingest-menu` and `menu-api`, then schedule `ingest-menu` every five minutes. The function converts time to `America/Los_Angeles`, performs an upstream fetch only during the first ten minutes of a configured meal window, and enforces one successful snapshot per date and period. This avoids daylight-saving drift in UTC cron expressions.

Set `EXPO_PUBLIC_MENU_API_URL` to the deployed `menu-api` function URL for production mobile builds.
