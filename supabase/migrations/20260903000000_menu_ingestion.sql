create extension if not exists pg_cron;
create extension if not exists pg_net;

create table if not exists public.menu_snapshots (
  id bigint generated always as identity primary key,
  location_id text not null check (location_id = 'gastronome'),
  menu_date date not null,
  scheduled_period text not null check (scheduled_period in ('breakfast', 'lunch', 'dinner')),
  source_fetched_at timestamptz not null,
  cached_at timestamptz not null default now(),
  payload jsonb not null,
  payload_checksum text not null,
  unique (location_id, menu_date, scheduled_period)
);

create table if not exists public.ingestion_runs (
  id bigint generated always as identity primary key,
  location_id text not null,
  menu_date date not null,
  scheduled_period text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('started', 'succeeded', 'failed', 'skipped')),
  status_code integer,
  error_message text
);

create index if not exists menu_snapshots_current_idx on public.menu_snapshots (location_id, menu_date desc, cached_at desc);
alter table public.menu_snapshots enable row level security;
alter table public.ingestion_runs enable row level security;
create policy "Public can read validated menu snapshots" on public.menu_snapshots for select to anon, authenticated using (true);
comment on table public.menu_snapshots is 'Validated normalized menu snapshots. Writes are service-only and require documented source approval.';
