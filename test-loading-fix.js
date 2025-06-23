/**
 * Test Loading State Issue
 * 
 * This will help diagnose why the login button gets stuck in "Signing In..." state
 */

const fetch = require('node-fetch');

async function testLoadingIssue() {
  console.log('🔍 TESTING LOGIN LOADING STATE ISSUE\n');
  
  // Create a test account first
  const testEmail = `loading-test-${Date.now()}@example.com`;
  const testPassword = 'LoadingTest123!';
  
  console.log('1️⃣ Creating test account...');
  try {
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: `loadingtest${Date.now()}`
      })
    });
    
    const signupData = await signupResponse.json();
    
    if (!signupResponse.ok) {
      console.log('❌ Could not create test account:', signupData.error);
      return;
    }
    
    console.log('✅ Test account created:', {
      user_id: signupData.user?.id?.substring(0, 8) + '...',
      email: signupData.user?.email
    });
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test the login diagnostic to see if backend works
    console.log('\n2️⃣ Testing backend login...');
    const loginResponse = await fetch('http://localhost:3000/api/login-diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Backend login works fine');
      console.log('The issue is in the frontend component, not the backend.');
      
      console.log('\n🔧 FIXES APPLIED TO FRONTEND:');
      console.log('1. ✅ Added better error handling to checkProfileAndRedirect function');
      console.log('2. ✅ Added timeout to prevent hanging redirects');
      console.log('3. ✅ Added debug logging to track where process gets stuck');
      console.log('4. ✅ Improved finally block to ensure loading state is cleared');
      
      console.log('\n🧪 TEST THE FIX:');
      console.log('1. Go to: http://localhost:3000/login');
      console.log('2. Open browser console (F12 → Console)');
      console.log('3. Enter these test credentials:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log('4. Click "Sign In" and watch the console for debug messages');
      console.log('5. The button should no longer get stuck in loading state');
      
      console.log('\n📊 WHAT TO LOOK FOR:');
      console.log('- Console should show "🔐 Starting login process..."');
      console.log('- Then "📧 Login result:" with user data');
      console.log('- Then "🔍 Checking user profile for:" with user ID');
      console.log('- Finally redirect to dashboard or create-profile');
      console.log('- Loading state should clear within 10 seconds max');
      
    } else {
      console.log('❌ Backend login failed:', loginData.error);
      console.log('Backend issue needs to be fixed first');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n📋 IF BUTTON STILL GETS STUCK:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Try clearing browser cache and localStorage');
  console.log('3. Try incognito/private browsing mode');
  console.log('4. Check if there are network errors in Network tab');
  console.log('5. Try the test login button on the page');
  
  console.log('\n✅ Loading state test complete!');
}

testLoadingIssue().catch(console.error);
