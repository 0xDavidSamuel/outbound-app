-- Run this in your Supabase SQL editor

-- Enable PostGIS for geo queries (optional but useful later)
create extension if not exists postgis;

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  full_name text,
  avatar_url text,
  bio text,
  skills text[] default '{}',
  github_url text,
  website_url text,
  lat double precision,
  lng double precision,
  city text,
  is_visible boolean default true,
  created_at timestamptz default now()
);

-- Events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  lat double precision not null,
  lng double precision not null,
  location_name text not null,
  date timestamptz not null,
  attendee_count int default 0,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- RLS: profiles are publicly readable
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- RLS: events are publicly readable
alter table public.events enable row level security;

create policy "Events are viewable by everyone"
  on public.events for select using (true);

create policy "Authenticated users can create events"
  on public.events for insert with check (auth.uid() = host_id);

-- Seed a couple of fake events (update lat/lng to your city)
insert into public.events (host_id, title, description, lat, lng, location_name, date, attendee_count, tags)
values
  (
    (select id from public.profiles limit 1),
    'LA Builders Meetup',
    'Monthly casual meetup for developers building products. Come say hi.',
    34.0522, -118.2437,
    'Arts District, Los Angeles',
    now() + interval '7 days',
    12,
    ARRAY['meetup', 'networking', 'builders']
  ),
  (
    (select id from public.profiles limit 1),
    'Web3 Dev Night',
    'Hacking on onchain stuff together. All levels welcome.',
    34.0195, -118.4912,
    'Santa Monica, CA',
    now() + interval '14 days',
    8,
    ARRAY['web3', 'solidity', 'ethereum']
  );
