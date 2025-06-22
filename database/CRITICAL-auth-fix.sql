-- CRITICAL: Run this SQL in your Supabase Dashboard SQL Editor
-- This will fix authentication issues by creating required tables

-- 1. Create profiles table (required for user registration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  music_preferences TEXT[],
  is_dj BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for profiles (with IF NOT EXISTS handling)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Create dj_rooms table
CREATE TABLE IF NOT EXISTS public.dj_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_live BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  max_viewers INTEGER DEFAULT 100,
  stream_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS for rooms
ALTER TABLE public.dj_rooms ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for rooms (with IF NOT EXISTS handling)
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.dj_rooms;
CREATE POLICY "Rooms are viewable by everyone" ON public.dj_rooms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create rooms" ON public.dj_rooms;
CREATE POLICY "Users can create rooms" ON public.dj_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Users can update their own rooms" ON public.dj_rooms;
CREATE POLICY "Users can update their own rooms" ON public.dj_rooms
  FOR UPDATE USING (auth.uid() = host_id);

-- 7. Create matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- 8. Create user_swipes table
CREATE TABLE IF NOT EXISTS public.user_swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- 9. Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id TEXT REFERENCES public.dj_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_dj_rooms_host_id ON public.dj_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_dj_rooms_is_live ON public.dj_rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper_id ON public.user_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches(user1_id, user2_id);

-- 11. Insert sample data for testing
INSERT INTO public.profiles (id, username, full_name, bio, music_preferences, is_dj, location) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'dj_alex', 'Alex Martinez', 'Electronic music producer and DJ from LA 🎵', ARRAY['Electronic', 'House', 'Techno'], true, 'Los Angeles, CA'),
  ('22222222-2222-2222-2222-222222222222', 'music_lover_sam', 'Sam Johnson', 'Music lover and party enthusiast ✨', ARRAY['Pop', 'Hip-Hop', 'R&B'], false, 'New York, NY'),
  ('33333333-3333-3333-3333-333333333333', 'vinyl_collector', 'Taylor Chen', 'Vinyl collector and indie music fan 🎶', ARRAY['Indie', 'Alternative', 'Jazz'], false, 'Austin, TX')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.dj_rooms (id, name, description, genre, host_id, is_live, viewer_count, tags)
VALUES 
  ('room-demo-electronic', 'Friday Night Electronic Vibes', 'Best electronic beats to end the week! Join me for some late night energy.', 'Electronic', '11111111-1111-1111-1111-111111111111', true, 23, ARRAY['electronic', 'weekend', 'party', 'house']),
  ('room-demo-indie', 'Chill Indie Afternoon', 'Relaxing indie and alternative music for your afternoon vibes.', 'Indie', '33333333-3333-3333-3333-333333333333', false, 0, ARRAY['indie', 'chill', 'alternative', 'relaxing'])
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! 🎉 You can now create accounts and log in.' as status;
