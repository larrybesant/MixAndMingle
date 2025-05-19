-- Create dj_followers table if it doesn't exist
CREATE TABLE IF NOT EXISTS dj_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dj_id, user_id)
);

-- Add RLS policies
ALTER TABLE dj_followers ENABLE ROW LEVEL SECURITY;

-- Anyone can view followers
CREATE POLICY "Anyone can view followers"
  ON dj_followers FOR SELECT
  USING (true);

-- Users can follow/unfollow DJs
CREATE POLICY "Users can follow/unfollow DJs"
  ON dj_followers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow DJs"
  ON dj_followers FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_dj_followers_dj_id ON dj_followers(dj_id);
CREATE INDEX IF NOT EXISTS idx_dj_followers_user_id ON dj_followers(user_id);
