const fetch = require('node-fetch');

// Comprehensive Email Authentication Test Suite
async function testEmailAuth() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 Testing Email Authentication System...\n');
  console.log('='.repeat(60));
  
  // Test 1: Check email configuration status
  console.log('\n1️⃣ Checking Email Configuration...');
  try {
    const response = await fetch(`${baseUrl}/api/test-email`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    console.log('📧 Email Configuration Status:', {
      configured: data.configured,
      status: data.status,
      message: data.message
    });
    
    if (!data.configured) {
      console.log('⚠️ EMAIL NOT CONFIGURED!');
      console.log('Setup instructions:', data.setup_instructions);
      console.log('\nPlease configure Resend API key before continuing...');
    }
  } catch (error) {
    console.log('❌ Email configuration check failed:', error.message);
  }
  
  // Test 2: Test email sending capability
  console.log('\n2️⃣ Testing Email Sending...');
  const testEmail = 'test@example.com'; // Change to your email to actually receive test
  
  try {
    const response = await fetch(`${baseUrl}/api/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Test email sent successfully!');
      console.log('Email ID:', data.email_id);
      console.log('Next steps:', data.next_steps);
    } else {
      console.log('❌ Test email failed:', data.error);
      if (data.troubleshooting) {
        console.log('Troubleshooting:', data.troubleshooting);
      }
    }
  } catch (error) {
    console.log('❌ Email sending test failed:', error.message);
  }
  
  // Test 3: Test signup with email templates
  console.log('\n3️⃣ Testing Signup with Email Templates...');
  const signupEmail = `test-signup-${Date.now()}@example.com`;
  const signupPassword = 'TestPassword123!';
  
  try {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: signupEmail,
        password: signupPassword,
        metadata: { 
          name: 'Test User',
          username: `testuser${Date.now()}`
        }
      })
    });
    
    const data = await response.json();
    console.log('📝 Signup Result:', {
      success: response.ok,
      user_id: data.user?.id,
      email_confirmed: data.user?.email_confirmed,
      email_sent: data.email?.sent,
      email_configured: data.email?.configured,
      email_error: data.email?.error,
      next_steps: data.next_steps
    });
    
    if (data.email?.sent) {
      console.log('✅ Welcome email sent successfully!');
    } else if (!data.email?.configured) {
      console.log('⚠️ Email not configured - user created but no confirmation email sent');
    } else {
      console.log('❌ Email sending failed:', data.email?.error);
    }
    
  } catch (error) {
    console.log('❌ Signup test failed:', error.message);
  }
  
  // Test 4: Test password reset flow
  console.log('\n4️⃣ Testing Password Reset Flow...');
  try {
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail })
    });
    
    const data = await response.json();
    console.log('🔐 Password Reset Result:', {
      success: response.ok,
      message: data.message,
      email_sent: data.email_sent,
      method: data.method,
      reset_link: data.reset_link ? 'Provided' : 'Not provided',
      next_steps: data.next_steps
    });
    
    if (data.reset_link) {
      console.log('📋 Direct reset link provided (email service not configured)');
    }
    
  } catch (error) {
    console.log('❌ Password reset test failed:', error.message);
  }
  
  console.log('\n✅ Email Authentication Test Complete!');
  
  console.log('\n🔧 SETUP CHECKLIST:');
  console.log('□ Get Resend API key from https://resend.com');
  console.log('□ Add RESEND_KEY to .env.local');
  console.log('□ Enable email provider in Supabase');
  console.log('□ Configure SMTP in Supabase with Resend');
  console.log('□ Test signup and password reset flows');
}

testEmailAuth().catch(console.error);
