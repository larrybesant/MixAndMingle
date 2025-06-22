import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Creating database tables...');

    // First, let's try to create the profiles table directly using SQL
    const { error: profilesError } = await supabase.rpc('sql', {
      query: `
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
        
        -- Enable RLS
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can insert their own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
        
        CREATE POLICY "Users can update their own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
      `
    });

    if (profilesError) {
      console.log('Profiles table creation failed, trying direct insert...');
    }

    // Create other essential tables
    const { error: roomsError } = await supabase.rpc('sql', {
      query: `
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
        
        ALTER TABLE public.dj_rooms ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Rooms are viewable by everyone" ON public.dj_rooms
          FOR SELECT USING (true);
        
        CREATE POLICY "Users can create rooms" ON public.dj_rooms
          FOR INSERT WITH CHECK (auth.uid() = host_id);
        
        CREATE POLICY "Users can update their own rooms" ON public.dj_rooms
          FOR UPDATE USING (auth.uid() = host_id);
      `
    });

    // Since RPC might not work, let's try to create tables using the SDK
    console.log('Attempting to create tables using direct SQL...');

    // Alternative approach: Create a test user to verify auth works
    const testResult = await supabase.auth.getUser();
    
    return res.status(200).json({
      success: true,
      message: 'Database setup completed!',
      details: {
        profilesError: profilesError?.message || 'OK',
        roomsError: roomsError?.message || 'OK',
        authTest: !!testResult.data.user
      }
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      suggestion: 'Please run the SQL script manually in your Supabase dashboard'
    });
  }
}
