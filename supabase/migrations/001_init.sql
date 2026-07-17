-- Azimut initial schema
-- Run this whole file top to bottom in the Supabase SQL Editor.
-- It is self contained and safe to run more than once.

-- Extensions -----------------------------------------------------------------
create extension if not exists pgcrypto; -- provides gen_random_uuid()

-- Tables ---------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz default now()
);

create table if not exists public.professions (
  id          serial primary key,
  name        text not null,
  category    text not null,
  base_risk   int  not null check (base_risk between 0 and 100)
);

create table if not exists public.assessments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  profession_id  int  references public.professions (id),
  answers        jsonb not null,
  risk_score     int  not null check (risk_score between 0 and 100),
  breakdown      jsonb not null,
  created_at     timestamptz default now()
);

create table if not exists public.roadmaps (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  assessment_id  uuid references public.assessments (id) on delete set null,
  created_at     timestamptz default now()
);

create table if not exists public.roadmap_steps (
  id            uuid primary key default gen_random_uuid(),
  roadmap_id    uuid not null references public.roadmaps (id) on delete cascade,
  title         text not null,
  description   text,
  category      text not null,
  order_index   int  not null,
  is_done       boolean default false,
  completed_at  timestamptz
);

create table if not exists public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  mood        int  not null check (mood between 1 and 5),
  body        text,
  created_at  timestamptz default now()
);

-- Auto profile creation ------------------------------------------------------
-- When a new auth user is created, insert a matching profiles row.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security ---------------------------------------------------------

alter table public.profiles        enable row level security;
alter table public.professions     enable row level security;
alter table public.assessments     enable row level security;
alter table public.roadmaps        enable row level security;
alter table public.roadmap_steps   enable row level security;
alter table public.journal_entries enable row level security;

-- profiles: a user may read and update only their own row.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- professions: readable by everyone, including anonymous visitors. No writes.
drop policy if exists professions_select_all on public.professions;
create policy professions_select_all on public.professions
  for select using (true);

-- assessments: owner has full access.
drop policy if exists assessments_select_own on public.assessments;
create policy assessments_select_own on public.assessments
  for select using (auth.uid() = user_id);

drop policy if exists assessments_insert_own on public.assessments;
create policy assessments_insert_own on public.assessments
  for insert with check (auth.uid() = user_id);

drop policy if exists assessments_update_own on public.assessments;
create policy assessments_update_own on public.assessments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists assessments_delete_own on public.assessments;
create policy assessments_delete_own on public.assessments
  for delete using (auth.uid() = user_id);

-- roadmaps: owner has full access.
drop policy if exists roadmaps_select_own on public.roadmaps;
create policy roadmaps_select_own on public.roadmaps
  for select using (auth.uid() = user_id);

drop policy if exists roadmaps_insert_own on public.roadmaps;
create policy roadmaps_insert_own on public.roadmaps
  for insert with check (auth.uid() = user_id);

drop policy if exists roadmaps_update_own on public.roadmaps;
create policy roadmaps_update_own on public.roadmaps
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists roadmaps_delete_own on public.roadmaps;
create policy roadmaps_delete_own on public.roadmaps
  for delete using (auth.uid() = user_id);

-- roadmap_steps: ownership resolved through the parent roadmap.
drop policy if exists roadmap_steps_select_own on public.roadmap_steps;
create policy roadmap_steps_select_own on public.roadmap_steps
  for select using (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  );

drop policy if exists roadmap_steps_insert_own on public.roadmap_steps;
create policy roadmap_steps_insert_own on public.roadmap_steps
  for insert with check (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  );

drop policy if exists roadmap_steps_update_own on public.roadmap_steps;
create policy roadmap_steps_update_own on public.roadmap_steps
  for update using (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  );

drop policy if exists roadmap_steps_delete_own on public.roadmap_steps;
create policy roadmap_steps_delete_own on public.roadmap_steps
  for delete using (
    exists (
      select 1 from public.roadmaps r
      where r.id = roadmap_steps.roadmap_id and r.user_id = auth.uid()
    )
  );

-- journal_entries: owner has full access.
drop policy if exists journal_entries_select_own on public.journal_entries;
create policy journal_entries_select_own on public.journal_entries
  for select using (auth.uid() = user_id);

drop policy if exists journal_entries_insert_own on public.journal_entries;
create policy journal_entries_insert_own on public.journal_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists journal_entries_update_own on public.journal_entries;
create policy journal_entries_update_own on public.journal_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists journal_entries_delete_own on public.journal_entries;
create policy journal_entries_delete_own on public.journal_entries
  for delete using (auth.uid() = user_id);

-- Seed data ------------------------------------------------------------------
-- About 25 professions across diverse categories. Inserted only when the
-- table is still empty, so re running this file will not create duplicates.

insert into public.professions (name, category, base_risk)
select v.name, v.category, v.base_risk
from (
  values
    ('Data Entry Clerk',              'Office and Admin',  90),
    ('Administrative Assistant',      'Office and Admin',  75),
    ('Receptionist',                  'Office and Admin',  72),
    ('Bookkeeper',                    'Office and Admin',  82),
    ('Accountant',                    'Finance',           70),
    ('Financial Analyst',             'Finance',           55),
    ('Bank Teller',                   'Finance',           85),
    ('Insurance Underwriter',         'Finance',           78),
    ('Graphic Designer',              'Creative',          55),
    ('Copywriter',                    'Creative',          60),
    ('Photographer',                  'Creative',          45),
    ('Software Developer',            'Tech',              40),
    ('Data Scientist',                'Tech',              35),
    ('IT Support Specialist',         'Tech',              50),
    ('QA Tester',                     'Tech',              65),
    ('Registered Nurse',              'Healthcare',        15),
    ('Physician',                     'Healthcare',        12),
    ('Medical Transcriptionist',      'Healthcare',        88),
    ('Teacher',                       'Education',         25),
    ('Corporate Trainer',             'Education',         45),
    ('Electrician',                   'Manual and Trades', 20),
    ('Plumber',                       'Manual and Trades', 18),
    ('Truck Driver',                  'Manual and Trades', 55),
    ('Customer Service Representative','Service',           80),
    ('Retail Cashier',                'Service',           85),
    ('Chef',                          'Service',           30)
) as v (name, category, base_risk)
where not exists (select 1 from public.professions);
