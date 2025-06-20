// Supabase SQL for friends and messages tables
// Run these in the Supabase SQL editor or via migration

-- Friends table (bidirectional friendship)
create table if not exists friends (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  status text default 'pending', -- 'pending', 'accepted', 'blocked'
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, friend_id)
);

-- Messages table (private/direct messages)
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Index for fast friend lookup
create index if not exists idx_friends_user on friends(user_id);
create index if not exists idx_friends_friend on friends(friend_id);

-- Index for fast message lookup
create index if not exists idx_messages_sender on messages(sender_id);
create index if not exists idx_messages_receiver on messages(receiver_id);
