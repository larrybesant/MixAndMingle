// Debug Larry's Login Issue
const fetch = require('node-fetch');

async function debugLarryLogin() {
  console.log('🔍 DEBUGGING LARRY\'S LOGIN - COMPREHENSIVE TEST');
  console.log('==============================================');
  console.log('Email: larrybesant@gmail.com');
  console.log('Password Length: 11 characters');
  console.log('Error: Invalid email or password');
  console.log('');
  
  const email = 'larrybesant@gmail.com';
  
  // Test 1: Check if user exists by trying to create account
  console.log('1️⃣ Checking if account exists...');
  try {
    const signupResponse = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: 'testpassword123' // Temporary password for test
      })
    });
    
    const signupData = await signupResponse.json();
    
    if (signupResponse.status === 409 || signupData.error?.includes('already registered')) {
      console.log('✅ Account EXISTS - User already registered');
      console.log('Issue: Likely wrong password or email verification needed');
    } else if (signupResponse.ok) {
      console.log('⚠️ Account was CREATED - You didn\'t have an account before');
      console.log('New user ID:', signupData.user?.id);
      console.log('Email confirmed:', signupData.user?.email_confirmed ? 'YES' : 'NO');
    } else {
      console.log('❌ Signup test failed:', signupData.error);
    }
  } catch (error) {
    console.log('❌ Account existence check failed:', error.message);
  }
  
  // Test 2: Try login diagnostic with common passwords
  console.log('\\n2️⃣ Testing common password patterns...');
  const commonPasswords = [
    'password123',
    'Password123',
    'password',
    'Password',
    '123456789',
    'mixandmingle',
    'larry123'
  ];
  
  for (const testPassword of commonPasswords) {
    if (testPassword.length === 11) { // Match the length you mentioned
      console.log(`Testing password length ${testPassword.length}: ${testPassword.substring(0,3)}...`);
      
      try {
        const response = await fetch('http://localhost:3001/api/login-diagnostic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            password: testPassword
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ SUCCESS with password: ${testPassword}`);
          console.log('User ID:', data.user?.id);
          console.log('Email confirmed:', data.user?.emailConfirmed);
          break;
        }
      } catch (error) {
        // Continue to next password
      }
    }
  }
  
  console.log('\\n💡 TROUBLESHOOTING STEPS:');
  console.log('');  console.log('📧 If account exists but password is wrong:');
  console.log('1. Try password reset:');
  console.log('   node -e "fetch(\'http://localhost:3001/api/auth/reset-password\', {method:\'POST\', headers:{\'Content-Type\':\'application/json\'}, body:JSON.stringify({email:\'larrybesant@gmail.com\'})}).then(r=>r.json()).then(console.log)"');
  console.log('');
  console.log('🆕 If no account exists:');
  console.log('1. Create account first:');
  console.log('   node -e "fetch(\'http://localhost:3001/api/auth/signup\', {method:\'POST\', headers:{\'Content-Type\':\'application/json\'}, body:JSON.stringify({email:\'larrybesant@gmail.com\',password:\'newpassword123\'})}).then(r=>r.json()).then(console.log)"');
  console.log('');
  console.log('🔧 If backend works but frontend fails:');
  console.log('1. Check browser console for JavaScript errors');
  console.log('2. Try incognito/private browsing mode');
  console.log('3. Clear browser cache and cookies');
  console.log('4. Use the correct URL: http://localhost:3001/login');
}

debugLarryLogin().catch(console.error);
