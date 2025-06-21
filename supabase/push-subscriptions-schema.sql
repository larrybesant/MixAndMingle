-- Push Subscriptions table for web push notifications
create table if not exists push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, endpoint)
);
