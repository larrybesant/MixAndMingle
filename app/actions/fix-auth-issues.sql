-- 1. Make sure all users in auth.users have confirmed emails
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE email_confirmed_at IS NULL;

-- 2. Ensure all users have corresponding profiles
INSERT INTO public.profiles (id, email, full_name, is_beta_tester, beta_joined_at, created_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name, 
  true as is_beta_tester,
  NOW() as beta_joined_at,
  NOW() as created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 3. Fix any potential issues with RLS policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they're working correctly
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
