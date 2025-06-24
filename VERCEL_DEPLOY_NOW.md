# 🚀 VERCEL DEPLOYMENT GUIDE

## Quick Deploy Steps (5-10 minutes)

### 1. Go to Vercel
- Visit: https://vercel.com
- Click "Sign up" or "Log in"
- Choose "Continue with GitHub"

### 2. Import Your Project
- Click "Add New..." → "Project"
- Find "MixAndMingle" in your repositories
- Click "Import"

### 3. Configure Environment Variables
Click "Environment Variables" and add these exactly:

**Variable 1:**
Name: `NEXT_PUBLIC_SUPABASE_URL`
Value: `https://ywfjmsbyksehjgwalqum.supabase.co`

**Variable 2:**
Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs`

**Variable 3:**
Name: `SUPABASE_SERVICE_ROLE_KEY`
Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMzMjA2OCwiZXhwIjoyMDYyOTA4MDY4fQ.yCEJpiyVvEZeyrb9SPfmEwwpWcB_UnQ9v51uefyEw_c`

**Variable 4:**
Name: `RESEND_KEY`
Value: `re_Zg6JXnLo_8mmvHBr3pXnTpbqF7TwNFY4C`

**Variable 5:**
Name: `ADMIN_EMAIL`
Value: `larrybesant@gmail.com`

**Variable 6:**
Name: `DAILY_API_KEY`
Value: `0363bbdb1e6d9b2a5350b528322a6fb953c680c50d5920193246bc61da448dc1`

**Variable 7:**
Name: `NODE_ENV`
Value: `production`

### 4. Deploy
- Click "Deploy"
- Wait 2-3 minutes for build to complete
- Get your production URL (something like: https://mix-and-mingle-xyz.vercel.app)

### 5. Test Your Live App
- Visit your production URL
- Test signup/login
- Create a test community
- Upload an image

## 🎯 Your app will be live in ~5 minutes!
