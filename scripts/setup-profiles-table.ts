import { supabase } from "../lib/supabase/client"

async function setupProfilesTable() {
  console.log("🔧 Setting up profiles table...")

  try {
    // First, let's check if the table exists by trying to select from it
    const { data, error } = await supabase.from("profiles").select("count(*)").limit(1)

    if (error) {
      console.error("❌ Profiles table does not exist or has issues:", error.message)
      console.log("📋 Please run this SQL in your Supabase SQL editor:")
      console.log(`
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  email TEXT,
  location TEXT,
  website TEXT,
  music_preferences TEXT[],
  is_dj BOOLEAN DEFAULT FALSE,
  privacy_settings JSONB DEFAULT '{}',
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `)
      return false
    }

    console.log("✅ Profiles table exists and is accessible")
    return true
  } catch (err) {
    console.error("❌ Error checking profiles table:", err)
    return false
  }
}

// Run the setup
setupProfilesTable().then((success) => {
  if (success) {
    console.log("🎉 Database setup complete!")
  } else {
    console.log("⚠️  Please set up the database manually using the SQL above")
  }
})
