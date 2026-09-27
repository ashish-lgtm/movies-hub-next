-- Profiles: run in Supabase SQL Editor after user_movies schema
-- https://supabase.com/dashboard/project/anxlwopvhjacjnxudyhv/sql/new

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    full_name text not null,
    date_of_birth date not null,
    phone text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
    on public.profiles
    for select
    using (auth.uid() = id);

create policy "Users can insert own profile"
    on public.profiles
    for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles
    for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
    before update on public.profiles
    for each row
    execute function public.set_updated_at();

notify pgrst, 'reload schema';
