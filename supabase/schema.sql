create table if not exists public.user_criteria (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  criteria jsonb not null default '[]',
  updated_at timestamp with time zone default now()
);

create table if not exists public.user_venues (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  venues jsonb not null default '[]',
  updated_at timestamp with time zone default now()
);

alter table public.user_criteria enable row level security;
alter table public.user_venues enable row level security;

alter table public.user_criteria
  add constraint user_criteria_user_id_key unique (user_id);

alter table public.user_venues
  add constraint user_venues_user_id_key unique (user_id);

drop policy if exists "Users can manage their own criteria" on public.user_criteria;
create policy "Users can manage their own criteria"
  on public.user_criteria
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage their own venues" on public.user_venues;
create policy "Users can manage their own venues"
  on public.user_venues
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.venue_lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  venue_ids text[] default '{}',
  created_at timestamp with time zone default now()
);

alter table public.venue_lists enable row level security;

drop policy if exists "Users can manage their own lists" on public.venue_lists;
create policy "Users can manage their own lists"
  on public.venue_lists
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.user_profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  wedding_date date,
  guest_count integer,
  updated_at timestamp with time zone default now()
);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can manage their own profile" on public.user_profiles;
create policy "Users can manage their own profile"
  on public.user_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
