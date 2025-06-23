const fetch = require('node-fetch');

async function diagnoseOAuthAndEmail() {
  console.log('🔍 Diagnosing Google OAuth and Email Issues...\n');
  
  // Test 1: Check email configuration
  console.log('1️⃣ Checking email configuration...');
  try {
    const response = await fetch('http://localhost:3000/api/email-config-check');
    const data = await response.json();
    
    console.log('📧 Email Config Status:', {
      resend_configured: data.resend_configured,
      twilio_configured: data.twilio_configured,
      smtp_available: data.smtp_configured,
      error: data.error
    });
    
    if (data.resend_configured) {
      console.log('✅ Resend API is configured');
    } else {
      console.log('❌ Resend API not properly configured');
      console.log('💡 Need to set RESEND_KEY in .env.local');
    }
    
  } catch (error) {
    console.log('❌ Email config check failed:', error.message);
  }
  
  // Test 2: Check current Supabase auth settings
  console.log('\n2️⃣ Checking Supabase auth settings...');
  try {
    const response = await fetch('http://localhost:3000/api/check-email-verification');
    const data = await response.json();
    
    console.log('🔐 Auth Settings:', {
      email_verification_required: !data.email_verification_status?.immediately_confirmed,
      google_oauth_enabled: 'Unknown - need to check Supabase dashboard',
      error: data.email_verification_status?.error
    });
    
  } catch (error) {
    console.log('❌ Auth settings check failed:', error.message);
  }
  
  // Test 3: Test password reset email functionality
  console.log('\n3️⃣ Testing password reset email...');
  try {
    const testEmail = `test-reset-${Date.now()}@example.com`;
    
    // First create a test account
    console.log('📝 Creating test account for password reset...');
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        username: `testreset${Date.now()}`
      })
    });
    
    const signupData = await signupResponse.json();
    
    if (signupData.success) {
      console.log('✅ Test account created');
      
      // Now test password reset
      console.log('📨 Testing password reset email...');
      const resetResponse = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail
        })
      });
      
      const resetData = await resetResponse.json();
      console.log('📧 Password reset result:', {
        success: resetResponse.ok,
        status: resetResponse.status,
        message: resetData.message,
        error: resetData.error
      });
      
    } else {
      console.log('❌ Failed to create test account:', signupData.error);
    }
    
  } catch (error) {
    console.log('❌ Password reset test failed:', error.message);
  }
  
  console.log('\n🔍 GOOGLE OAUTH DIAGNOSIS:');
  console.log('Google OAuth requires configuration in Supabase dashboard:');
  console.log('');
  console.log('📋 STEPS TO FIX GOOGLE OAUTH:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers');
  console.log('2. Find "Google" provider');
  console.log('3. Enable it and configure:');
  console.log('   - Client ID from Google Cloud Console');
  console.log('   - Client Secret from Google Cloud Console');
  console.log('   - Redirect URL: https://ywfjmsbyksehjgwalqum.supabase.co/auth/v1/callback');
  console.log('');
  console.log('📋 GOOGLE CLOUD CONSOLE SETUP:');
  console.log('1. Go to: https://console.cloud.google.com/');
  console.log('2. Create/select project');
  console.log('3. Enable Google+ API');
  console.log('4. Create OAuth 2.0 credentials');
  console.log('5. Add authorized redirect URI: https://ywfjmsbyksehjgwalqum.supabase.co/auth/v1/callback');
  console.log('');
  console.log('🔍 EMAIL ISSUE DIAGNOSIS:');
  console.log('');
  console.log('📧 RESEND API SETUP (for password reset emails):');
  console.log('1. Go to: https://resend.com/');
  console.log('2. Create account and get API key');
  console.log('3. Update .env.local: RESEND_KEY=re_your_actual_key');
  console.log('4. Restart your dev server');
  console.log('');
  console.log('⚙️ SUPABASE EMAIL SETTINGS:');
  console.log('1. Go to: https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/templates');
  console.log('2. Configure email templates');
  console.log('3. Set up SMTP settings if needed');
  console.log('');
  console.log('🎯 IMMEDIATE WORKAROUNDS:');
  console.log('1. For login: Use email/password login (backend is working)');
  console.log('2. For password reset: Use "forgot password" link on login page');
  console.log('3. For Google OAuth: Set up Google credentials in Supabase');
  
  console.log('\n✅ OAuth and Email diagnosis complete!');
}

diagnoseOAuthAndEmail();
