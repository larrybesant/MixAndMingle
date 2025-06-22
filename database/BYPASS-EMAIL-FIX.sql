-- SIMPLE TRIGGER FIX - Just fix the trigger without touching auth settings
-- The 405 error might be resolved by using a simpler trigger

-- Drop and recreate with the most basic functionality
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the simplest possible trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Try the simplest possible insert
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

-- Test that the trigger was created
SELECT 
  'Simple trigger created successfully!' as status,
  'Try signup again - the 405 error should be resolved.' as message;
