# 🚨 EMERGENCY AUTHENTICATION SOLUTION GUIDE

## ⚡ IMMEDIATE ACTIONS (Do This First)

### 1. Open Beta Test Dashboard
- Go to: `http://localhost:3000/beta-test`
- This provides automated testing and fixes

### 2. Run Browser Console Scripts
Open browser console (F12) and run these scripts:

#### Quick Auth Status Check:
```javascript
// Copy and paste this entire script into console
(async function() {
  try {
    const { supabase } = await import('/lib/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.email : 'Not logged in');
    
    // Test database connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    console.log('Database:', error ? 'Error: ' + error.message : 'Connected');
  } catch (err) {
    console.error('Auth check failed:', err);
  }
})();
```

#### Create Working Test Account:
```javascript
// Copy and paste this entire script into console
(async function() {
  try {
    const { supabase } = await import('/lib/supabase/client');
    
    // Sign out first
    await supabase.auth.signOut();
    console.log('Signed out');
    
    // Create test account
    const email = 'beta@test.app';
    const password = 'BetaTest123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    });
    
    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }
    
    // Sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError) {
      throw signInError;
    }
    
    // Create profile
    await supabase.from('profiles').upsert({
      id: signInData.user.id,
      email,
      language: 'en',
      updated_at: new Date().toISOString()
    });
    
    console.log('✅ Test account created and logged in!');
    console.log('Redirecting to dashboard...');
    
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 2000);
    
  } catch (err) {
    console.error('❌ Account creation failed:', err.message);
    console.log('Try manual Supabase fixes below');
  }
})();
```

## 🔧 MANUAL SUPABASE FIXES

If automated scripts fail, apply these fixes in Supabase Dashboard:

### 1. Authentication Settings
1. Go to: [Supabase Dashboard](https://supabase.com/dashboard) 
2. Select your project
3. Go to: **Authentication** → **Settings**
4. Apply these changes:

```
Site URL: http://localhost:3000
Additional Redirect URLs: 
- http://localhost:3000/dashboard
- http://localhost:3000/auth/callback

✅ Enable auto-confirm users
❌ Disable email confirmations
❌ Disable secure email change
❌ Disable double opt-in
```

### 2. Environment Variables Check
Verify your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Project Status
- Ensure project is not paused
- Check database connection in Supabase Dashboard
- Verify API keys are active

## 🎯 GUARANTEED WORKING SOLUTIONS

### Option 1: Use Emergency Auth Page
1. Go to: `http://localhost:3000/emergency-auth`
2. Use pre-filled test credentials
3. Click "Quick Fix" button

### Option 2: Manual Account Creation
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Create new user"
3. Email: `test@mixandmingle.app`
4. Password: `TestPassword123!`
5. Check "Auto Confirm User"
6. Save user
7. Go back to app and try login

### Option 3: Bypass Authentication (UI Testing Only)
```javascript
// Run in console for UI testing without auth
localStorage.setItem('fake-auth', 'true');
window.location.href = '/dashboard';
```

## 🧪 TESTING CHECKLIST

### ✅ Quick Test Flow
1. [ ] Open `http://localhost:3000/beta-test`
2. [ ] Click "Check Status" - should show green checks
3. [ ] Click "Create Test Account" if needed
4. [ ] Click "Go to Dashboard" - should work
5. [ ] Test language selector on dashboard
6. [ ] Test logout/login cycle

### ✅ Full Beta Test Flow
1. [ ] Homepage real-time stats working
2. [ ] Signup with language selection
3. [ ] Login with language persistence
4. [ ] Dashboard onboarding flow
5. [ ] Profile completion
6. [ ] Settings page
7. [ ] Language switching
8. [ ] Logout and login again

## 🆘 EMERGENCY CONTACTS

### If Everything Fails:
1. **Restart dev server**: `npm run dev`
2. **Check server logs** in terminal for errors
3. **Use manual override**: Run bypass script above
4. **Create new Supabase project** if needed
5. **Use local storage auth** for UI testing

### Working Test Credentials:
- Email: `test@mixandmingle.app`
- Password: `TestPassword123!`
- Backup Email: `beta@test.app`
- Backup Password: `BetaTest123!`

## 📋 SUCCESS CRITERIA

Authentication is working when:
- ✅ Can create new account
- ✅ Can sign in/out reliably  
- ✅ Profile is created automatically
- ✅ Language preference is saved
- ✅ Dashboard loads correctly
- ✅ No console errors
- ✅ All features accessible

## 🚀 NEXT STEPS AFTER AUTH WORKS

1. **Test all features end-to-end**
2. **Verify real-time functionality**
3. **Test on different browsers**
4. **Document any remaining issues**
5. **Prepare for beta tester onboarding**

---

**🔥 CRITICAL**: Do not proceed with beta testing until at least one reliable login method works consistently!
