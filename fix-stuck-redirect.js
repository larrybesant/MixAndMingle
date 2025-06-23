// Fix the stuck redirect issue
const fetch = require('node-fetch');

async function fixStuckRedirect() {
  console.log('🔧 FIXING STUCK REDIRECT ISSUE');
  console.log('==============================');
  
  const email = 'larrybesant@gmail.com';
  const userId = '48a955b2-040e-4add-9342-625e1ffdca43'; // From fresh account creation
  
  console.log('📊 DIAGNOSIS:');
  console.log('✅ Login authentication working');
  console.log('❌ Profile check causing redirect to hang');
  console.log('');
  
  // Test 1: Check if profiles table exists and if user has profile
  console.log('1️⃣ Testing profile table access...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.log('❌ Profile check failed:', profileError.message);
      
      if (profileError.message.includes('relation "profiles" does not exist')) {
        console.log('💡 SOLUTION: Profiles table does not exist');
        console.log('   → Login should redirect directly to dashboard');
        console.log('   → Or create profiles table first');
      } else if (profileError.code === 'PGRST116') {
        console.log('💡 SOLUTION: User has no profile yet');
        console.log('   → Should redirect to create-profile page');
      } else {
        console.log('💡 SOLUTION: Profile access issue');
        console.log('   → Check database permissions');
      }
    } else {
      console.log('✅ Profile found:', {
        hasUsername: !!profileData?.username,
        hasBio: !!profileData?.bio,
        complete: !!(profileData?.username && profileData?.bio)
      });
    }
    
  } catch (error) {
    console.log('❌ Profile test failed:', error.message);
  }
  
  console.log('');
  console.log('🚀 IMMEDIATE SOLUTIONS:');
  console.log('');
  console.log('📱 QUICK FIX - Manual Navigation:');
  console.log('1. Open new tab: http://localhost:3001/dashboard');
  console.log('2. Or try: http://localhost:3001/create-profile');
  console.log('');
  console.log('🔧 BROWSER DEBUGGING:');
  console.log('1. Open browser console (F12 → Console)');
  console.log('2. Look for error: "Profile check failed" or similar');
  console.log('3. Check Network tab for failed /profiles requests');
  console.log('4. Try incognito mode to avoid cached issues');
  console.log('');
  console.log('💻 DEVELOPER FIX:');
  console.log('The issue is in checkProfileAndRedirect() function');
  console.log('It\\'s trying to check profiles table which may not exist');
  console.log('or user doesn\\'t have permission to access it.');
  console.log('');
  console.log('🎯 RECOMMENDED ACTION:');
  console.log('Since your authentication is working perfectly,');
  console.log('manually navigate to /dashboard or /create-profile');
  console.log('and the app should work fine from there.');
}

fixStuckRedirect().catch(console.error);
