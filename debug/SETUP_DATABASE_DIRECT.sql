-- 🗄️ MIX & MINGLE COMMUNITIES DATABASE SETUP
-- Run this SQL script in Supabase SQL Editor

-- ============================================================
-- COMMUNITIES SCHEMA SETUP
-- ============================================================

-- 1. Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  genre_id TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  banner_url TEXT,
  is_private BOOLEAN DEFAULT false,
  invite_code TEXT UNIQUE DEFAULT substring(gen_random_uuid()::text from 1 for 8),
  member_count INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 1000,
  rules TEXT,
  tags TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Community members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('creator', 'admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- 3. Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'poll', 'event')),
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category_id);
CREATE INDEX IF NOT EXISTS idx_communities_creator ON communities(creator_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Communities are viewable by everyone" ON communities
  FOR SELECT USING (true);

CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their communities" ON communities
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their communities" ON communities
  FOR DELETE USING (auth.uid() = creator_id);

-- Community members policies
CREATE POLICY "Community members are viewable by everyone" ON community_members
  FOR SELECT USING (true);

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Community posts policies
CREATE POLICY "Community posts are viewable by everyone" ON community_posts
  FOR SELECT USING (true);

CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = community_posts.community_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Post authors can update their posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Post authors can delete their posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- STORAGE BUCKET FOR COMMUNITY IMAGES
-- ============================================================

-- Create storage bucket for community images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-images', 
  'community-images', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for community images
CREATE POLICY "Community images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-images');

CREATE POLICY "Authenticated users can upload community images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'community-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================

-- Function to update member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities 
    SET member_count = member_count + 1
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities 
    SET member_count = member_count - 1
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for member count updates
DROP TRIGGER IF EXISTS trigger_update_member_count ON community_members;
CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();

-- Function to automatically add creator as member
CREATE OR REPLACE FUNCTION add_creator_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO community_members (community_id, user_id, role)
  VALUES (NEW.id, NEW.creator_id, 'creator');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as member
DROP TRIGGER IF EXISTS trigger_add_creator_as_member ON communities;
CREATE TRIGGER trigger_add_creator_as_member
  AFTER INSERT ON communities
  FOR EACH ROW EXECUTE FUNCTION add_creator_as_member();

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================

-- If we get here, everything worked!
SELECT 'Communities schema setup completed successfully!' as message;
