-- SQL migration to add communities table and related tables
-- Run this in Supabase SQL editor

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id VARCHAR(50) NOT NULL,
  genre_id VARCHAR(50),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  avatar_url TEXT,
  banner_url TEXT,
  is_private BOOLEAN DEFAULT false,
  invite_code VARCHAR(20) UNIQUE,
  member_count INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 1000,
  rules TEXT,
  tags TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member', -- 'creator', 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Community posts table (for community discussions)
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200),
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video', 'poll', 'event'
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community events table
CREATE TABLE IF NOT EXISTS community_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) DEFAULT 'general', -- 'meetup', 'stream', 'party', 'workshop', etc.
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT, -- physical or virtual
  max_attendees INTEGER,
  attendee_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community join requests (for private communities)
CREATE TABLE IF NOT EXISTS community_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category_id);
CREATE INDEX IF NOT EXISTS idx_communities_creator ON communities(creator_id);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_community ON community_events(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_start_time ON community_events(start_time);

-- Generate invite codes automatically
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(LEFT(MD5(RANDOM()::TEXT), 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate invite code on community creation
CREATE OR REPLACE FUNCTION set_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invite_code
  BEFORE INSERT ON communities
  FOR EACH ROW
  EXECUTE FUNCTION set_invite_code();

-- Update member count when users join/leave
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

CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_member_count();

-- RLS policies
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;

-- Communities policies
CREATE POLICY "Public communities are viewable by everyone" ON communities
  FOR SELECT USING (is_private = false);

CREATE POLICY "Private communities viewable by members" ON communities
  FOR SELECT USING (
    is_private = true AND id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Community creators can update their communities" ON communities
  FOR UPDATE USING (auth.uid() = creator_id);

-- Community members policies
CREATE POLICY "Community members viewable by community members" ON community_members
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join communities" ON community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities" ON community_members
  FOR DELETE USING (auth.uid() = user_id);

-- Posts policies
CREATE POLICY "Community posts viewable by members" ON community_posts
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can create posts" ON community_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

-- Events policies  
CREATE POLICY "Community events viewable by members" ON community_events
  FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can create events" ON community_events
  FOR INSERT WITH CHECK (
    auth.uid() = creator_id AND
    community_id IN (
      SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
  );
