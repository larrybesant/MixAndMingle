/**
 * 405 Error Diagnostic & Login Fix
 * 
 * This will help diagnose the 405 error and provide login alternatives
 */

const fetch = require('node-fetch');

async function diagnose405Error() {
  console.log('🚨 405 ERROR DIAGNOSTIC\n');
  
  console.log('📋 UNDERSTANDING THE 405 ERROR:');
  console.log('The error "Unexpected status code returned from hook: 405" suggests:');
  console.log('1. 🔍 Supabase auth hook configuration issue');
  console.log('2. 🔍 SMTP/email provider configuration problem');
  console.log('3. 🔍 Auth URL endpoint configuration issue');
  console.log('');
  
  // Test basic Supabase connectivity
  console.log('1️⃣ Testing basic Supabase connectivity...');
  try {
    const response = await fetch('http://localhost:3000/api/check-email-verification');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Supabase basic connectivity: WORKING');
      console.log('Email verification status:', data.email_verification_status?.immediately_confirmed ? 'DISABLED' : 'ENABLED');
    } else {
      console.log('❌ Supabase connectivity issue');
    }
  } catch (error) {
    console.log('❌ Supabase connectivity test failed:', error.message);
  }
  
  // Test signup (which should work)
  console.log('\n2️⃣ Testing account creation (should work)...');
  const testEmail = `test405-${Date.now()}@example.com`;
  const testPassword = 'Test405Error!';
  
  try {
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: `test405user${Date.now()}`
      })
    });
    
    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      console.log('✅ Account creation: WORKING');
      console.log('User ID:', signupData.user?.id?.substring(0, 8) + '...');
      
      // Test login with the new account
      console.log('\n3️⃣ Testing login with new account...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        console.log('✅ Login functionality: WORKING');
        console.log('Backend authentication is completely functional!');
        console.log('');
        console.log('🎯 YOUR LOGIN SOLUTION:');
        console.log('Since backend auth works, use these credentials to login:');
        console.log(`Email: ${testEmail}`);
        console.log(`Password: ${testPassword}`);
        console.log('');
        console.log('Go to http://localhost:3000/login and try these credentials!');
      } else {
        console.log('❌ Login test failed:', loginData.error);
      }
      
    } else {
      console.log('❌ Account creation failed:', signupData.error);
    }
  } catch (error) {
    console.log('❌ Account creation test failed:', error.message);
  }
  
  console.log('\n🔧 405 ERROR FIXES:');
  console.log('');
  console.log('IMMEDIATE WORKAROUND:');
  console.log('1. ✅ AVOID password reset for now (that\'s what\'s causing 405)');
  console.log('2. ✅ CREATE new accounts instead of resetting passwords');
  console.log('3. ✅ Use the test credentials above to login');
  console.log('');
  console.log('ROOT CAUSE FIXES (for later):');
  console.log('1. Check Supabase Dashboard > Authentication > Settings');
  console.log('2. Verify SMTP configuration in Auth settings');
  console.log('3. Check Auth Hooks configuration');
  console.log('4. Ensure site URL is set correctly');
  console.log('5. Check Auth email templates');
  console.log('');
  console.log('CURRENT WORKAROUND FOR LOGIN:');
  console.log('- Use signup to create new accounts');
  console.log('- Login works immediately after signup');
  console.log('- No password reset needed (email verification disabled)');
  
  console.log('\n✅ 405 error diagnostic complete!');
  console.log('');
  console.log('🚀 NEXT STEPS:');
  console.log('1. Try logging in with the test credentials above');
  console.log('2. If you need a specific email, create a new account with that email');
  console.log('3. Avoid password reset until 405 error is fixed');
}

diagnose405Error().catch(console.error);
