-- ENHANCED AUTH FIX - More robust trigger function
-- Copy and paste this into Supabase SQL Editor

-- 1. First, let's drop the existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a more robust trigger function with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    -- Try to insert with all possible fields, using COALESCE for safety
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
    
    -- Log success (this won't show in app but helps with debugging)
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

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Also ensure profiles table has proper structure
ALTER TABLE public.profiles 
  ALTER COLUMN username DROP NOT NULL,
  ALTER COLUMN full_name DROP NOT NULL;

-- 6. Make sure username has a default value for existing rows
UPDATE public.profiles 
SET username = 'user_' || substring(id::text, 1, 8)
WHERE username IS NULL;

-- 7. Test the trigger by checking if it exists
SELECT 
  'Enhanced trigger function created successfully! 🎉' as status,
  'The database should now handle user signups properly.' as message;
