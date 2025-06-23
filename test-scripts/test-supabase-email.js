const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSupabaseEmail() {
  console.log('🧪 Testing Supabase Email Capabilities');
  console.log('=====================================');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing Supabase credentials');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n1️⃣ Testing Supabase Connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError && !healthError.message.includes('relation "profiles" does not exist')) {
      console.log('❌ Supabase connection failed:', healthError.message);
      return;
    }
    console.log('✅ Supabase connection successful');

    // Test 2: Try password reset (this will show if email is configured)
    console.log('\n2️⃣ Testing Password Reset Email...');
    const testEmail = 'test@example.com'; // Use a test email
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      console.log('❌ Password reset failed:', error.message);
      
      // Common error messages and their meanings
      if (error.message.includes('SMTP')) {
        console.log('💡 This indicates Supabase email is NOT configured properly');
        console.log('📧 Recommendation: Use Resend for reliable email delivery');
      } else if (error.message.includes('rate limit')) {
        console.log('💡 Rate limited - email system is working but throttled');
        console.log('✅ Supabase email appears to be configured');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('💡 Email system working, but user not confirmed');
        console.log('✅ Supabase email appears to be configured');
      }
    } else {
      console.log('✅ Password reset email request successful');
      console.log('📧 Supabase email appears to be working');
    }

    // Test 3: Check auth settings
    console.log('\n3️⃣ Checking Auth Configuration...');
    console.log('Supabase URL:', supabaseUrl);
    console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL);

  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }

  console.log('\n🎯 RECOMMENDATION:');
  console.log('Based on your previous tests where emails weren\'t being delivered,');
  console.log('I recommend setting up Resend for reliable email delivery.');
  console.log('\nNext steps:');
  console.log('1. Get a real Resend API key from https://resend.com');
  console.log('2. Verify your domain in Resend dashboard');
  console.log('3. Update RESEND_KEY in .env.local');
  console.log('4. Test email delivery with Resend');
}

testSupabaseEmail().catch(console.error);
