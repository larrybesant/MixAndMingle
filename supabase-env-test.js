// Environment Test for Supabase Configuration
// Run this in browser console at http://localhost:3000

console.log('🔍 Testing Supabase Environment Configuration...\n');

// Test 1: Check if environment variables are loaded
console.log('1. Environment Variables:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'MISSING');

// Test 2: Test Supabase client initialization
console.log('\n2. Supabase Client Test:');
try {
  // Try to import and test the client
  import('/lib/supabase/client.js').then(({ supabase }) => {
    console.log('   ✅ Supabase client imported successfully');
    
    // Test basic connection
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.log('   ❌ Supabase connection error:', error.message);
      } else {
        console.log('   ✅ Supabase connection working');
        console.log('   📊 Current session:', data.session ? 'User logged in' : 'No active session');
      }
    });
    
    // Test database access
    supabase.from('profiles').select('count').then(({ data, error }) => {
      if (error) {
        console.log('   ❌ Database access error:', error.message);
        console.log('   💡 This might be expected if no profiles table exists yet');
      } else {
        console.log('   ✅ Database access working');
      }
    });
    
  });
} catch (err) {
  console.log('   ❌ Failed to import Supabase client:', err);
}

// Test 3: Network connectivity
console.log('\n3. Network Test:');
const supabaseUrl = window.location.hostname === 'localhost' 
  ? 'Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL'
  : 'Will be tested with actual environment variables';
  
console.log('   💡 Supabase URL source:', supabaseUrl);

console.log('\n🧪 HOW TO TEST SIGNUP MANUALLY:');
console.log('1. Open Network tab in DevTools');
console.log('2. Go to http://localhost:3000/signup');
console.log('3. Fill in test data:');
console.log('   - Username: testuser123');
console.log('   - Email: test@example.com');
console.log('   - Password: testpass123');
console.log('4. Click "Create Account"');
console.log('5. Watch for:');
console.log('   - Console logs with 🚀 🔐 📧 ✅ icons');
console.log('   - Network requests to Supabase');
console.log('   - Success message and redirect');
console.log('   - Any error messages');

console.log('\n🚨 COMMON ISSUES & SOLUTIONS:');
console.log('❌ "Missing Supabase environment variables"');
console.log('   → Check .env.local file exists and has correct vars');
console.log('❌ "Failed to fetch" or CORS errors');
console.log('   → Check Supabase project settings and allowed origins');
console.log('❌ "User already registered"');
console.log('   → Use a different email or check Supabase Auth dashboard');
console.log('❌ "Profile creation failed"');
console.log('   → Check database schema is applied in Supabase');
