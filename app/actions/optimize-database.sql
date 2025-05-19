-- Create beta_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS beta_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  max_uses INTEGER,
  uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add missing indexes to profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_beta_tester ON profiles(is_beta_tester);
CREATE INDEX IF NOT EXISTS idx_profiles_is_dj ON profiles(is_dj);

-- Fix RLS policies for profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create improved policies
CREATE POLICY "Anyone can read public profile fields"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Set up RLS for beta_codes table
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for beta_codes
CREATE POLICY "Anyone can read active beta codes"
  ON beta_codes FOR SELECT
  USING (
    (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR uses < max_uses)
  );

CREATE POLICY "Only admins can insert beta codes"
  ON beta_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Only admins can update beta codes"
  ON beta_codes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Insert default beta code if it doesn't exist
INSERT INTO beta_codes (code, description, max_uses)
VALUES ('MIXBETA2023', 'Default beta invitation code', 1000)
ON CONFLICT (code) DO NOTHING;

-- Add is_admin column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
