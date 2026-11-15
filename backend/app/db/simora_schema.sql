-- SIMORA database schema. Run in Supabase SQL Editor.
create table if not exists public.listings (
  id text primary key,
  title text not null,
  location text not null,
  region text not null,
  lat double precision not null,
  lng double precision not null,
  hectares numeric not null check (hectares > 0),
  price numeric not null check (price >= 0),
  period text not null check (period in ('month','year','total')),
  transaction text not null check (transaction in ('rent','sale','both')),
  description text not null,
  soil text, water text, access text, crop text, image text, owner text,
  owner_id uuid references auth.users(id) on delete cascade,
  status text not null default 'available',
  created_at timestamptz not null default now()
);
create table if not exists public.deals (
  id text primary key,
  listing_id text references public.listings(id) on delete cascade,
  listing_title text not null,
  type text not null check (type in ('rental','purchase')),
  name text,
  user_id uuid references auth.users(id) on delete cascade,
  start_date date,
  end_date date,
  offer numeric,
  status text not null default 'Request sent',
  created_at timestamptz not null default now()
);
alter table public.listings enable row level security;
alter table public.deals enable row level security;
drop policy if exists "Listings are visible to everyone" on public.listings;
create policy "Listings are visible to everyone" on public.listings for select using (true);
drop policy if exists "Authenticated users can publish listings" on public.listings;
create policy "Authenticated users can publish listings" on public.listings for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "Owners can update their listings" on public.listings;
create policy "Owners can update their listings" on public.listings for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "Owners can delete their listings" on public.listings;
create policy "Owners can delete their listings" on public.listings for delete to authenticated using (auth.uid() = owner_id);
drop policy if exists "Users can view their own deals" on public.deals;
create policy "Users can view their own deals" on public.deals for select to authenticated using (auth.uid() = user_id or exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
drop policy if exists "Users can create their own deals" on public.deals;
create policy "Users can create their own deals" on public.deals for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Listing owners can update enquiries" on public.deals;
create policy "Listing owners can update enquiries" on public.deals for update to authenticated using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid())) with check (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
