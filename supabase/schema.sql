-- Movies Hub: run this in Supabase SQL Editor
-- Dashboard → SQL → New query → paste → Run
-- Direct link: https://supabase.com/dashboard/project/anxlwopvhjacjnxudyhv/sql/new

create extension if not exists "pgcrypto";

create table if not exists public.user_movies (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    tmdb_id integer not null,
    media_type text not null check (media_type in ('movie', 'tv')),
    title text not null,
    poster_path text,
    status text not null check (status in ('watchlist', 'watched')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (user_id, tmdb_id, media_type)
);

create index if not exists user_movies_user_status_idx
    on public.user_movies (user_id, status);

alter table public.user_movies enable row level security;

drop policy if exists "Users can view own movies" on public.user_movies;
drop policy if exists "Users can insert own movies" on public.user_movies;
drop policy if exists "Users can update own movies" on public.user_movies;
drop policy if exists "Users can delete own movies" on public.user_movies;

create policy "Users can view own movies"
    on public.user_movies
    for select
    using (auth.uid() = user_id);

create policy "Users can insert own movies"
    on public.user_movies
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update own movies"
    on public.user_movies
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete own movies"
    on public.user_movies
    for delete
    using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists user_movies_set_updated_at on public.user_movies;

create trigger user_movies_set_updated_at
    before update on public.user_movies
    for each row
    execute function public.set_updated_at();

-- Refresh PostgREST schema cache so the API sees the new table immediately
notify pgrst, 'reload schema';
