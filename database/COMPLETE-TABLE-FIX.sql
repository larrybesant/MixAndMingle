-- COMPLETE TABLE FIX - This will create the correct table structure first
-- Copy and paste this into Supabase SQL Editor

-- 1. First, let's see what columns exist and add missing ones
DO $$
BEGIN
    -- Add username column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'username'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN username TEXT;
        RAISE NOTICE 'Added username column';
    END IF;
    
    -- Add full_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        RAISE NOTICE 'Added full_name column';
    END IF;
    
    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column';
    END IF;
    
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;
END
$$;

-- 2. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create the robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Try to insert with the columns that should now exist
    INSERT INTO public.profiles (
      id, 
      username, 
      full_name, 
      avatar_url,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substring(NEW.id::text, 1, 8)),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', 'New User'),
      NEW.raw_user_meta_data->>'avatar_url',
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Successfully created profile for user %', NEW.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- If user already exists, just update the profile
      UPDATE public.profiles 
      SET 
        username = COALESCE(NEW.raw_user_meta_data->>'username', username),
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
        updated_at = NOW()
      WHERE id = NEW.id;
      
      RAISE NOTICE 'Updated existing profile for user %', NEW.id;
      
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to create/update profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Add unique constraint on username (but allow nulls)
DROP INDEX IF EXISTS profiles_username_key;
CREATE UNIQUE INDEX profiles_username_unique ON public.profiles(username) WHERE username IS NOT NULL;

-- 6. Success message
SELECT 
  'Table structure fixed and trigger created! 🎉' as status,
  'All required columns have been added to the profiles table.' as message;
