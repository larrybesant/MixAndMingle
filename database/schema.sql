-- Mix & Mingle Database Schema
-- This works with both Supabase and Neon

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  room_id UUID REFERENCES dj_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'tip'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Room Participants table
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES dj_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'follow', 'room_invite', 'tip'
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table (social connections)
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Room History table (track past streams)
CREATE TABLE IF NOT EXISTS room_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES dj_rooms(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  peak_viewers INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Swipes table (tracks all swipe actions)
CREATE TABLE IF NOT EXISTS user_swipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table (when two users like each other)
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Match Messages table (messages between matched users)
CREATE TABLE IF NOT EXISTS match_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'image'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences table (for matching algorithm)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 50,
  preferred_distance INTEGER DEFAULT 50, -- km
  music_genres TEXT[],
  show_me TEXT DEFAULT 'all' CHECK (show_me IN ('all', 'djs_only', 'non_djs')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_dj_rooms_host_id ON dj_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_dj_rooms_is_live ON dj_rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper_id ON user_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiped_id ON user_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_action ON user_swipes(action);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);
CREATE INDEX IF NOT EXISTS idx_match_messages_match_id ON match_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_created_at ON match_messages(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dj_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- DJ Rooms policies
CREATE POLICY "DJ rooms are viewable by everyone" ON dj_rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON dj_rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Room hosts can update their rooms" ON dj_rooms
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Room hosts can delete their rooms" ON dj_rooms
  FOR DELETE USING (auth.uid() = host_id);

-- Chat messages policies
CREATE POLICY "Chat messages are viewable by everyone" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Room participants policies
CREATE POLICY "Room participants are viewable by everyone" ON room_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON room_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- User Swipes policies
CREATE POLICY "Users can view their own swipes" ON user_swipes
  FOR SELECT USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create their own swipes" ON user_swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" ON matches
  FOR INSERT WITH CHECK (true); -- Handled by trigger function

-- Match Messages policies
CREATE POLICY "Match participants can view messages" ON match_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Match participants can send messages" ON match_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
      AND matches.is_active = true
    )
  );

-- User Preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = id);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update room viewer count
CREATE OR REPLACE FUNCTION update_room_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE dj_rooms 
    SET viewer_count = viewer_count + 1 
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE dj_rooms 
    SET viewer_count = GREATEST(viewer_count - 1, 0) 
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for viewer count
DROP TRIGGER IF EXISTS room_participant_count_trigger ON room_participants;
CREATE TRIGGER room_participant_count_trigger
  AFTER INSERT OR DELETE ON room_participants
  FOR EACH ROW EXECUTE FUNCTION update_room_viewer_count();

-- Matching System Tables

-- User Swipes table (tracks all swipe actions)
CREATE TABLE IF NOT EXISTS user_swipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  swiper_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(swiper_id, swiped_id)
);

-- Matches table (when two users like each other)
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id) -- Ensure consistent ordering
);

-- Match Messages table (messages between matched users)
CREATE TABLE IF NOT EXISTS match_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'image'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences table (for matching algorithm)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 50,
  preferred_distance INTEGER DEFAULT 50, -- km
  music_genres TEXT[],
  show_me TEXT DEFAULT 'all' CHECK (show_me IN ('all', 'djs_only', 'non_djs')),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for matching performance
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper_id ON user_swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_swiped_id ON user_swipes(swiped_id);
CREATE INDEX IF NOT EXISTS idx_user_swipes_action ON user_swipes(action);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_matched_at ON matches(matched_at);
CREATE INDEX IF NOT EXISTS idx_match_messages_match_id ON match_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_match_messages_created_at ON match_messages(created_at);

-- RLS for matching tables
ALTER TABLE user_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- User Swipes policies
CREATE POLICY "Users can view their own swipes" ON user_swipes
  FOR SELECT USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create their own swipes" ON user_swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" ON matches
  FOR INSERT WITH CHECK (true); -- Handled by trigger function

-- Match Messages policies
CREATE POLICY "Match participants can view messages" ON match_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

CREATE POLICY "Match participants can send messages" ON match_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE matches.id = match_messages.match_id 
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
      AND matches.is_active = true
    )
  );

-- User Preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = id);

-- Function to create matches when mutual likes occur
CREATE OR REPLACE FUNCTION create_match_on_mutual_like()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create match if this is a 'like' action
  IF NEW.action = 'like' THEN
    -- Check if the swiped user has already liked the swiper
    IF EXISTS (
      SELECT 1 FROM user_swipes 
      WHERE swiper_id = NEW.swiped_id 
      AND swiped_id = NEW.swiper_id 
      AND action = 'like'
    ) THEN
      -- Create a match (ensure consistent ordering)
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
      
      -- Create notifications for both users
      INSERT INTO notifications (user_id, title, message, type, data)
      VALUES 
        (NEW.swiper_id, 'New Match! 🎉', 'You have a new match!', 'match', 
         jsonb_build_object('match_user_id', NEW.swiped_id)),
        (NEW.swiped_id, 'New Match! 🎉', 'You have a new match!', 'match', 
         jsonb_build_object('match_user_id', NEW.swiper_id));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic match creation
DROP TRIGGER IF EXISTS create_match_trigger ON user_swipes;
CREATE TRIGGER create_match_trigger
  AFTER INSERT ON user_swipes
  FOR EACH ROW EXECUTE FUNCTION create_match_on_mutual_like();

-- Function to get potential matches for a user
CREATE OR REPLACE FUNCTION get_potential_matches(user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  music_preferences TEXT[],
  is_dj BOOLEAN,
  age INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.music_preferences,
    p.is_dj,
    EXTRACT(YEAR FROM AGE(COALESCE(p.date_of_birth, CURRENT_DATE - INTERVAL '25 years')))::INTEGER as age
  FROM profiles p
  WHERE p.id != user_id
    AND p.id NOT IN (
      -- Exclude users already swiped on
      SELECT us.swiped_id 
      FROM user_swipes us 
      WHERE us.swiper_id = user_id
    )
    AND p.id NOT IN (
      -- Exclude users who have already swiped on this user
      SELECT us.swiper_id 
      FROM user_swipes us 
      WHERE us.swiped_id = user_id AND us.action = 'pass'
    )
  ORDER BY RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
