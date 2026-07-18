-- Azimut migration 002: copy the sign up full name into the profile
-- Run this in the Supabase SQL Editor after 001_init.sql.
-- The existing on_auth_user_created trigger keeps pointing at this function,
-- so replacing the function is enough.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do update
    set full_name = excluded.full_name;
  return new;
end;
$$;
