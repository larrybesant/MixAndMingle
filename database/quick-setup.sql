-- Quick setup script for Supabase
-- Execute this in your Supabase SQL editor to set up the database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core tables for immediate functionality

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  music_preferences TEXT[],
  is_dj BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DJ Rooms table
CREATE TABLE IF NOT EXISTS dj_rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_live BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  stream_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id TEXT REFERENCES dj_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matching tables
CREATE TABLE IF NOT EXISTS user_swipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_dj_rooms_host_id ON dj_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_dj_rooms_is_live ON dj_rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper_id ON user_swipes(swiper_id);

-- Sample data for testing
INSERT INTO profiles (id, username, full_name, bio, music_preferences, is_dj) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'dj_alex', 'Alex Martinez', 'Electronic music producer and DJ', ARRAY['Electronic', 'House', 'Techno'], true),
  ('00000000-0000-0000-0000-000000000002', 'music_lover_sam', 'Sam Johnson', 'Music lover and party enthusiast', ARRAY['Pop', 'Hip-Hop', 'R&B'], false),
  ('00000000-0000-0000-0000-000000000003', 'vinyl_collector', 'Taylor Chen', 'Vinyl collector and indie music fan', ARRAY['Indie', 'Alternative', 'Jazz'], false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO dj_rooms (id, name, description, genre, host_id, is_live, viewer_count, tags)
VALUES 
  ('room-1', 'Friday Night Vibes', 'Best electronic beats to end the week', 'Electronic', '00000000-0000-0000-0000-000000000001', true, 25, ARRAY['electronic', 'weekend', 'party']),
  ('room-2', 'Chill Jazz Session', 'Relaxing jazz for your evening', 'Jazz', '00000000-0000-0000-0000-000000000003', true, 12, ARRAY['jazz', 'chill', 'relaxing'])
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! 🎉' as status;
