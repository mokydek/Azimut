-- Azimut migration 004: weekly review ritual
-- Run this in the Supabase SQL Editor after 001-003.

create table if not exists public.weekly_reviews (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  note           text,
  focus_step_id  uuid references public.roadmap_steps (id) on delete set null,
  created_at     timestamptz default now()
);

alter table public.weekly_reviews enable row level security;

drop policy if exists weekly_reviews_select_own on public.weekly_reviews;
create policy weekly_reviews_select_own on public.weekly_reviews
  for select using (auth.uid() = user_id);

drop policy if exists weekly_reviews_insert_own on public.weekly_reviews;
create policy weekly_reviews_insert_own on public.weekly_reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists weekly_reviews_update_own on public.weekly_reviews;
create policy weekly_reviews_update_own on public.weekly_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists weekly_reviews_delete_own on public.weekly_reviews;
create policy weekly_reviews_delete_own on public.weekly_reviews
  for delete using (auth.uid() = user_id);
