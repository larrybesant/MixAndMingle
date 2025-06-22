-- SIMPLE AUTH FIX - Run this in Supabase SQL Editor
-- This handles existing tables and policies gracefully

-- 1. Ensure profiles table exists with correct structure
DO $$
BEGIN
    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
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
        
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Created profiles table';
    ELSE
        -- Table exists, ensure it has all required columns
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'username'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN username TEXT UNIQUE;
            RAISE NOTICE 'Added username column to existing profiles table';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'full_name'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
            RAISE NOTICE 'Added full_name column to existing profiles table';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'bio'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN bio TEXT;
            RAISE NOTICE 'Added bio column to existing profiles table';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'music_preferences'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN music_preferences TEXT[];
            RAISE NOTICE 'Added music_preferences column to existing profiles table';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'is_dj'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN is_dj BOOLEAN DEFAULT false;
            RAISE NOTICE 'Added is_dj column to existing profiles table';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'location'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN location TEXT;
            RAISE NOTICE 'Added location column to existing profiles table';
        END IF;
        
        -- Ensure RLS is enabled
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Updated existing profiles table';
    END IF;
END $$;

-- 2. Recreate RLS policies (drop and recreate to avoid conflicts)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    
    -- Create fresh policies
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
        FOR SELECT USING (true);
    
    CREATE POLICY "Users can insert their own profile" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    
    CREATE POLICY "Users can update their own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    
    RAISE NOTICE 'Updated RLS policies for profiles';
END $$;

-- 3. Create or update dj_rooms table
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dj_rooms') THEN
        CREATE TABLE public.dj_rooms (
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
        RAISE NOTICE 'Created dj_rooms table';
    ELSE
        -- Table exists, ensure it has the host_id column
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'dj_rooms' AND column_name = 'host_id'
        ) THEN
            ALTER TABLE public.dj_rooms ADD COLUMN host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added host_id column to existing dj_rooms table';
        END IF;
        
        -- Ensure RLS is enabled
        ALTER TABLE public.dj_rooms ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Updated existing dj_rooms table';
    END IF;
END $$;

-- 4. Update dj_rooms RLS policies
DO $$
BEGIN
    -- Only create policies if the host_id column exists
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'dj_rooms' AND column_name = 'host_id'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.dj_rooms;
        DROP POLICY IF EXISTS "Users can create rooms" ON public.dj_rooms;
        DROP POLICY IF EXISTS "Users can update their own rooms" ON public.dj_rooms;
        
        -- Create fresh policies
        CREATE POLICY "Rooms are viewable by everyone" ON public.dj_rooms
            FOR SELECT USING (true);
        
        CREATE POLICY "Users can create rooms" ON public.dj_rooms
            FOR INSERT WITH CHECK (auth.uid() = host_id);
        
        CREATE POLICY "Users can update their own rooms" ON public.dj_rooms
            FOR UPDATE USING (auth.uid() = host_id);
        
        RAISE NOTICE 'Updated RLS policies for dj_rooms';
    ELSE
        RAISE NOTICE 'Skipping dj_rooms RLS policies - host_id column not found';
    END IF;
END $$;

-- 5. Create supporting tables
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id)
);

CREATE TABLE IF NOT EXISTS public.user_swipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(swiper_id, swiped_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id TEXT REFERENCES public.dj_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance (only if columns exist)
DO $$
BEGIN
    -- Create indexes only if the columns exist
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
        RAISE NOTICE 'Created index on profiles.username';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'dj_rooms' AND column_name = 'host_id') THEN
        CREATE INDEX IF NOT EXISTS idx_dj_rooms_host_id ON public.dj_rooms(host_id);
        RAISE NOTICE 'Created index on dj_rooms.host_id';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'dj_rooms' AND column_name = 'is_live') THEN
        CREATE INDEX IF NOT EXISTS idx_dj_rooms_is_live ON public.dj_rooms(is_live);
        RAISE NOTICE 'Created index on dj_rooms.is_live';
    END IF;
    
    -- These should always exist if tables were created
    CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
    CREATE INDEX IF NOT EXISTS idx_user_swipes_swiper_id ON public.user_swipes(swiper_id);
    CREATE INDEX IF NOT EXISTS idx_matches_users ON public.matches(user1_id, user2_id);
    
    RAISE NOTICE 'Created performance indexes';
END $$;

-- 7. Skip test data insertion to avoid foreign key errors
DO $$
BEGIN
    RAISE NOTICE 'Skipping sample data insertion to avoid foreign key constraint errors';
    RAISE NOTICE 'Real user profiles will be created automatically when users sign up';
END $$;

-- 8. CREATE THE CRITICAL TRIGGER FUNCTION (This fixes the 405 error!)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function that automatically creates profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Insert a profile for the new user
  INSERT INTO public.profiles (id, username, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
    
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Success message
SELECT 'AUTH FIX COMPLETE! ✅ You can now create accounts and log in. Try signing up at /signup' as result;
