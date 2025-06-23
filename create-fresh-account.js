// Create fresh account after cleanup
const fetch = require('node-fetch');

async function createFreshAccount() {
  console.log('🚀 CREATING FRESH ACCOUNT');
  console.log('========================');
  
  const email = 'larrybesant@gmail.com';
  const password = 'NewPassword123!'; // Strong password for fresh start
  
  console.log('📧 Email:', email);
  console.log('🔒 Password length:', password.length, 'characters');
  console.log('');

  try {
    // Create new account
    console.log('1️⃣ Creating fresh account...');
    const signupResponse = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const signupData = await signupResponse.json();
    
    console.log('📝 Account creation result:', {
      success: signupResponse.ok,
      status: signupResponse.status,
      user_id: signupData.user?.id,
      email_confirmed: signupData.user?.email_confirmed || signupData.user?.email_confirmed_at ? 'YES' : 'NO',
      email_sent: signupData.email?.sent || signupData.emailSent,
      provider: signupData.email?.provider || signupData.emailProvider,
      message: signupData.message,
      error: signupData.error
    });
    
    if (signupResponse.ok) {
      console.log('');
      console.log('✅ SUCCESS: Fresh account created!');
      console.log('📧 User ID:', signupData.user?.id);
      
      if (signupData.email?.sent || signupData.emailSent) {
        console.log('📬 Confirmation email sent successfully');
        console.log('🎯 Check your email at:', email);
      }
      
      // Wait a moment then test login
      console.log('');
      console.log('2️⃣ Testing login with new credentials...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const loginResponse = await fetch('http://localhost:3001/api/login-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });
      
      const loginData = await loginResponse.json();
      
      console.log('🔐 Login test result:', {
        success: loginResponse.ok,
        status: loginResponse.status,
        user_id: loginData.user?.id,
        email_confirmed: loginData.user?.emailConfirmed,
        error: loginData.error,
        suggestion: loginData.suggestion
      });
      
      if (loginResponse.ok) {
        console.log('');
        console.log('🎉 PERFECT! Your fresh account is working!');
        console.log('✅ Account created successfully');
        console.log('✅ Login working perfectly');
        console.log('✅ Email system functioning');
        console.log('');
        console.log('🔑 YOUR NEW CREDENTIALS:');
        console.log('Email:', email);
        console.log('Password: NewPassword123!');
        console.log('');
        console.log('🚀 NEXT STEPS:');
        console.log('1. Go to http://localhost:3001/login');
        console.log('2. Use the credentials above');
        console.log('3. You should login successfully!');
        
      } else {
        console.log('');
        console.log('⚠️ Account created but login failed');
        console.log('💡 Suggestion:', loginData.suggestion);
        console.log('🔧 Try waiting a moment and test again');
      }
      
    } else {
      console.log('');
      console.log('❌ Account creation failed');
      console.log('Error:', signupData.error);
      console.log('');
      console.log('💡 Possible solutions:');
      console.log('1. Wait a moment for database cleanup to complete');
      console.log('2. Try a different email temporarily');
      console.log('3. Check if server is running on port 3001');
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure server is running: npm run dev');
    console.log('2. Check port 3001 is accessible');
    console.log('3. Verify database cleanup completed');
  }
}

createFreshAccount().catch(console.error);
