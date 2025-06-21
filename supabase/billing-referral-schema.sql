-- Referral tracking table
create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid references profiles(id) on delete cascade,
  referred_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Transaction table for all payments (tips, gifts, user-to-user, etc.)
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  amount numeric(10,2) not null,
  type text not null, -- 'tip', 'gift', 'user_payment', etc.
  platform_fee numeric(10,2) not null default 0,
  referral_fee numeric(10,2) not null default 0,
  room_id uuid references rooms(id),
  created_at timestamp with time zone default timezone('utc', now())
);

-- Monthly host analytics for payouts
create table if not exists host_analytics (
  id uuid primary key default uuid_generate_v4(),
  host_id uuid references profiles(id) on delete cascade,
  month text not null, -- e.g. '2025-06'
  unique_viewers int not null,
  payout_amount numeric(10,2) not null default 0,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Add referral_code to profiles for sharing
alter table profiles add column if not exists referral_code text unique;
