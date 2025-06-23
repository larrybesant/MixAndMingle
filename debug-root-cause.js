const fetch = require('node-fetch');

async function comprehensiveDebug() {
  console.log('🔍 COMPREHENSIVE LOGIN DEBUG - Finding Root Cause\n');
  
  // Test 1: Basic server connectivity
  console.log('1️⃣ Testing basic server connectivity...');
  try {
    const response = await fetch('http://localhost:3000/api/check-email-verification');
    console.log('✅ Server is responding:', response.status);
  } catch (error) {
    console.log('❌ Server not responding:', error.message);
    console.log('🚨 CRITICAL: Dev server may not be running!');
    return;
  }
  
  // Test 2: Create account and immediately test
  console.log('\n2️⃣ Creating fresh account for testing...');
  const testEmail = `debug-${Date.now()}@example.com`;
  const testPassword = 'DebugTest123!';
  
  try {
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: `debug${Date.now()}`
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Account creation:', {
      success: signupResponse.ok,
      status: signupResponse.status,
      user_id: signupData.user?.id,
      error: signupData.error
    });
    
    if (!signupResponse.ok) {
      console.log('❌ SIGNUP FAILING - This explains login issues!');
      console.log('Error details:', signupData);
      return;
    }
    
    // Test 3: Immediate login test
    console.log('\n3️⃣ Testing immediate login after signup...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const loginResponse = await fetch('http://localhost:3000/api/login-diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('🔐 Login test result:', {
      success: loginResponse.ok,
      status: loginResponse.status,
      user_id: loginData.user?.id,
      error: loginData.error,
      suggestion: loginData.suggestion
    });
    
    if (loginResponse.ok) {
      console.log('\n✅ BACKEND LOGIN WORKS!');
      console.log('🎯 FRESH WORKING CREDENTIALS:');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
      console.log('\n🔧 FRONTEND DEBUGGING NEEDED:');
      console.log('1. Try these credentials in your browser');
      console.log('2. Open browser console (F12) and watch for errors');
      console.log('3. Look for "🔐 Starting login process..." message');
      console.log('4. If you see that but login fails, check browser Network tab');
    } else {
      console.log('\n❌ BACKEND LOGIN ALSO FAILING!');
      console.log('🚨 CRITICAL ISSUE FOUND');
      console.log('Error:', loginData.error);
      console.log('Suggestion:', loginData.suggestion);
      
      // Test 4: Check Supabase configuration
      console.log('\n4️⃣ Checking Supabase configuration...');
      
      if (loginData.error?.includes('Invalid login credentials')) {
        console.log('🔍 "Invalid credentials" suggests:');
        console.log('- Account creation might be failing silently');
        console.log('- Email verification issues');
        console.log('- Supabase auth configuration problems');
        
        // Test direct account lookup
        console.log('\n🔍 Testing account lookup...');
        try {
          const checkResponse = await fetch('http://localhost:3000/api/auth/check-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testEmail })
          });
          
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            console.log('👤 Account exists:', checkData.exists);
            console.log('✅ Email confirmed:', checkData.emailConfirmed);
          }
        } catch (err) {
          console.log('Cannot check account - endpoint may not exist');
        }
      }
    }
    
  } catch (error) {
    console.log('💥 Critical error:', error.message);
  }
  
  // Test 5: Environment variables check
  console.log('\n5️⃣ Checking environment configuration...');
  try {
    const envResponse = await fetch('http://localhost:3000/api/debug-env', {
      method: 'GET'
    });
    
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('🌐 Environment check:', envData);
    } else {
      console.log('⚠️ Cannot check environment - endpoint may not exist');
    }
  } catch (err) {
    console.log('⚠️ Environment check failed');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('- If signup fails: Supabase configuration issue');
  console.log('- If signup works but login fails: Authentication logic issue');
  console.log('- If backend works but frontend fails: Browser/JavaScript issue');
  console.log('- Check browser console for detailed error messages');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Try the credentials above in your browser');
  console.log('2. Report what specific error messages you see');
  console.log('3. Check browser Network tab for failed requests');
  console.log('4. Try the green "Create & Login Test Account" button');
}

comprehensiveDebug();
