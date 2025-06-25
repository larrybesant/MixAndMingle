# 🧹 User Cleanup Guide for Testing

## Quick Manual Cleanup (Recommended)

### Option 1: Supabase Dashboard (Easiest)

1. Go to your Supabase dashboard
2. Navigate to "Authentication" → "Users"
3. Delete all existing users manually
4. Navigate to "Table Editor" → "profiles"
5. Delete all rows in the profiles table

### Option 2: Browser Console Cleanup

1. Start the development server: `npm run dev`
2. Go to your signup page: `http://localhost:3000/signup`
3. Open browser DevTools (F12)
4. Copy and paste this code in the console:

```javascript
// Quick cleanup from browser console
async function clearUsers() {
  const { createClient } = await import("@supabase/supabase-js");

  // Use your public config (safe for browser)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  console.log("🧹 Clearing profiles...");
  const { error } = await supabase.from("profiles").delete().neq("id", "");

  if (error) {
    console.error("Error:", error);
    console.log("💡 Try manual deletion from Supabase dashboard");
  } else {
    console.log("✅ Cleanup complete!");
  }
}
clearUsers();
```

## 🎯 Testing Plan After Cleanup

1. **Fresh Signup Test**: Create a new account with language selection
2. **Language Storage Test**: Verify language is saved to localStorage
3. **Profile Integration Test**: Check language is saved in user profile
4. **Login Test**: Test login and language persistence
5. **Language Switch Test**: Change language and verify it works

## 🚀 Ready to Test!

After cleanup, you can test:

- Signup with language selection
- Profile creation with language preference
- Real-time language switching
- localStorage persistence
- Database integration

The language feature is fully implemented and ready for testing! 🎉
