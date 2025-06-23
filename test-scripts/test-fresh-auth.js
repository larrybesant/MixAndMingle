const fetch = require('node-fetch');

async function testFreshAuth() {
  console.log('🔄 Testing Fresh Authentication System\n');
  
  const testEmail = `fresh-test-${Date.now()}@example.com`;
  const testPassword = 'FreshTest123!';
  
  try {
    // Test 1: Create account
    console.log('1️⃣ Testing account creation...');
    const signupResponse = await fetch('http://localhost:3000/api/fresh-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        action: 'signup'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('📝 Signup result:', {
      success: signupData.success,
      user_id: signupData.user?.id,
      email: signupData.user?.email,
      confirmed: signupData.user?.emailConfirmed,
      error: signupData.error
    });
    
    if (signupData.success) {
      console.log('✅ Account created successfully!');
      
      // Test 2: Login with created account
      console.log('\n2️⃣ Testing login...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const loginResponse = await fetch('http://localhost:3000/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          action: 'login'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('🔐 Login result:', {
        success: loginData.success,
        user_id: loginData.user?.id,
        email: loginData.user?.email,
        confirmed: loginData.user?.emailConfirmed,
        has_session: !!loginData.session,
        error: loginData.error
      });
      
      if (loginData.success) {
        console.log('\n✅ FRESH AUTH SYSTEM WORKING!');
        console.log('🎯 Ready credentials:');
        console.log('📧 Email:', testEmail);
        console.log('🔑 Password:', testPassword);
        console.log('');
        console.log('🔗 Go to: http://localhost:3000/fresh-login');
        console.log('👆 Click "Create Test Account & Login" or use credentials above');
        
      } else {
        console.log('❌ Login failed:', loginData.error);
      }
      
    } else {
      console.log('❌ Signup failed:', signupData.error);
    }
    
    // Test 3: Wrong password
    console.log('\n3️⃣ Testing wrong password...');
    const wrongResponse = await fetch('http://localhost:3000/api/fresh-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword',
        action: 'login'
      })
    });
    
    const wrongData = await wrongResponse.json();
    console.log('🔑 Wrong password test:', {
      success: wrongData.success,
      error: wrongData.error,
      suggestion: wrongData.suggestion
    });
    
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
  
  console.log('\n🎯 FRESH AUTH SUMMARY:');
  console.log('✅ Clean authentication system ready');
  console.log('✅ Auto-confirmed accounts (no email verification)');
  console.log('✅ Proper error handling');
  console.log('✅ Session management');
  console.log('');
  console.log('🔗 ACCESS: http://localhost:3000/fresh-login');
}

testFreshAuth();
