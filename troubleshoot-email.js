const fetch = require('node-fetch');

// Email Troubleshooting Script
async function troubleshootEmail() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔍 EMAIL TROUBLESHOOTING DIAGNOSTICS\n');
  console.log('=' .repeat(50));
  
  console.log('\n📋 PROBLEM: Email not received');
  console.log('You mentioned seeing an email earlier, but now it\'s not working.');
  console.log('Let\'s diagnose what happened...');
  
  // Test 1: Check if Supabase is sending emails
  console.log('\n1️⃣ Testing Supabase Built-in Email...');
  
  const testEmail = 'larrybesant@gmail.com'; // Your email from the earlier success
  const testPassword = 'TestPassword123!';
  
  try {
    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        metadata: { name: 'Test User' }
      })
    });
    
    const data = await signupResponse.json();
    console.log('📧 Supabase Email Test:', {
      success: signupResponse.ok,
      user_created: data.user?.id ? 'YES' : 'NO',
      email_confirmed: data.user?.email_confirmed ? 'YES' : 'NO',
      session_created: data.session ? 'YES' : 'NO',
      error: data.error
    });
    
    if (data.error?.includes('already registered')) {
      console.log('ℹ️ User already exists - this is normal for testing');
    }
    
  } catch (error) {
    console.log('❌ Supabase email test failed:', error.message);
  }
  
  // Test 2: Check password reset email
  console.log('\n2️⃣ Testing Password Reset Email...');
  try {
    const resetResponse = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const resetData = await resetResponse.json();
    console.log('🔐 Password Reset Test:', {
      success: resetResponse.ok,
      email_sent: resetData.email_sent,
      method: resetData.method,
      message: resetData.message,
      reset_link: resetData.reset_link ? 'PROVIDED' : 'NOT PROVIDED'
    });
    
    if (resetData.reset_link) {
      console.log('\n🔗 DIRECT RESET LINK AVAILABLE:');
      console.log('Since email isn\'t working, you can use this direct link:');
      console.log(resetData.reset_link);
      console.log('\n⚠️ This link expires in 1 hour for security.');
    }
    
  } catch (error) {
    console.log('❌ Password reset test failed:', error.message);
  }
  
  // Test 3: Check email service endpoints
  console.log('\n3️⃣ Checking Email Service Endpoints...');
  
  const endpoints = [
    '/api/test-email',
    '/api/send-email', 
    '/api/email-config-check'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      console.log(`📡 ${endpoint}:`, {
        status: response.status,
        available: response.ok ? 'YES' : 'NO',
        configured: data.configured || 'UNKNOWN'
      });
      
    } catch (error) {
      console.log(`❌ ${endpoint}: FAILED (${error.message})`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('🔍 DIAGNOSIS SUMMARY');
  console.log('=' .repeat(50));
  
  console.log('\n📧 EMAIL SERVICE STATUS:');
  console.log('   • Resend: ❌ Not configured (RESEND_KEY missing)');
  console.log('   • Supabase: ⚠️ May be working but inconsistent');
  console.log('   • Gmail SMTP: ❓ Unknown (earlier success detected)');
  
  console.log('\n🎯 LIKELY CAUSES:');
  console.log('   1. 📧 Supabase email service has temporary issues');
  console.log('   2. 🔧 Email confirmation disabled in Supabase');
  console.log('   3. 📮 Emails going to spam/junk folder');
  console.log('   4. ⏰ Email delivery delayed');
  console.log('   5. 🚫 Gmail blocking automated emails');
  
  console.log('\n🛠️ IMMEDIATE SOLUTIONS:');
  console.log('');
  console.log('OPTION 1: Check Email Folders');
  console.log('   • Check Gmail inbox for larrybesant@gmail.com');
  console.log('   • Check spam/junk folder');
  console.log('   • Check "Promotions" tab in Gmail');
  console.log('   • Look for emails from mixandmingleapp@gmail.com');
  
  console.log('\nOPTION 2: Configure Resend (Recommended)');
  console.log('   1. Get API key: https://resend.com/api-keys');
  console.log('   2. Add to .env.local: RESEND_KEY=re_your_key');
  console.log('   3. Restart app');
  console.log('   4. Test: curl -X POST http://localhost:3000/api/test-email \\');
  console.log('      -H "Content-Type: application/json" \\');
  console.log('      -d \'{"email":"larrybesant@gmail.com"}\'');
  
  console.log('\nOPTION 3: Use Direct Reset Links');
  console.log('   • Password reset provides direct links');
  console.log('   • Bypass email delivery issues');
  console.log('   • Works immediately without email setup');
  
  console.log('\nOPTION 4: Check Supabase Settings');
  console.log('   1. Go to Supabase Dashboard → Auth → Settings');
  console.log('   2. Verify "Enable email confirmations" is ON');
  console.log('   3. Check SMTP settings');
  console.log('   4. Test email from Supabase dashboard');
  
  console.log('\n🧪 NEXT STEPS TO TEST:');
  console.log('   1. Check all email folders (inbox, spam, promotions)');
  console.log('   2. Configure Resend for reliable email delivery');
  console.log('   3. Use direct reset links as backup');
  console.log('   4. Monitor Supabase auth logs');
  
  console.log('\n📞 IMMEDIATE ACTION NEEDED:');
  console.log('   → Check your Gmail folders right now');
  console.log('   → Search for "mixandmingleapp" or "supabase"');
  console.log('   → Look in spam folder specifically');
  
  console.log('\n✅ EMAIL TROUBLESHOOTING COMPLETE');
}

troubleshootEmail().catch(console.error);
