-- Upgrade waitlist — captures email + optional name before payments go live
create table if not exists public.upgrade_waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  name        text,
  user_id     uuid references auth.users(id) on delete set null,
  source      text default 'upgrade_page',
  created_at  timestamptz not null default now(),
  unique (email)
);

alter table public.upgrade_waitlist enable row level security;

-- Only service-role can read; inserts are open (anonymous users can join)
create policy "waitlist_insert" on public.upgrade_waitlist
  for insert with check (true);
