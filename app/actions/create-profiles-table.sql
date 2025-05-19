-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  is_dj BOOLEAN DEFAULT FALSE,
  is_beta_tester BOOLEAN DEFAULT FALSE,
  beta_joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for the profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to read any profile
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
