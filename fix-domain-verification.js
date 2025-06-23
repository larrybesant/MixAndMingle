const fetch = require('node-fetch');

// Quick test for Resend domain verification issue
async function testEmailWithSandbox() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔧 Testing Email with Resend Sandbox Domain...\n');
  
  console.log('📋 DOMAIN VERIFICATION ISSUE DETECTED');
  console.log('Resend requires domain verification for production emails.');
  console.log('');
  
  // Test with sandbox domain
  console.log('1️⃣ Testing with Resend sandbox domain...');
  try {
    const response = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        email: 'test@example.com', // Using example.com for testing
        name: 'Test User',
        url: 'https://djmixandmingle.com/auth/callback?token=test123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Email sent successfully with sandbox domain!');
      console.log('Email ID:', data.email_id);
    } else {
      console.log('❌ Email failed:', data.error);
      if (data.solution) {
        console.log('\n🔧 SOLUTION:');
        console.log(data.solution.message);
        console.log('\nSTEPS:');
        data.solution.steps.forEach(step => console.log(`   ${step}`));
        console.log('\n💡 TEMPORARY FIX:', data.solution.temporary_fix);
      }
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n📋 DOMAIN VERIFICATION SOLUTIONS:');
  console.log('');
  console.log('🚀 OPTION 1: Use Resend Sandbox (IMMEDIATE)');
  console.log('   • Sender: onboarding@resend.dev');
  console.log('   • Works immediately without verification');
  console.log('   • Good for testing and development');
  console.log('   • Limited to test emails');
  
  console.log('\n🌐 OPTION 2: Verify Your Domain (PRODUCTION)');
  console.log('   1. Go to https://resend.com/domains');
  console.log('   2. Add domain: djmixandmingle.com');
  console.log('   3. Add DNS records:');
  console.log('      • TXT record for verification');
  console.log('      • CNAME for DKIM');
  console.log('   4. Wait for verification (can take 24-48 hours)');
  console.log('   5. Use noreply@djmixandmingle.com');
  
  console.log('\n⚡ OPTION 3: Use Different Email Service (ALTERNATIVE)');
  console.log('   • Gmail SMTP (free but limited)');
  console.log('   • SendGrid (has free tier)');
  console.log('   • Mailgun (has free tier)');
  console.log('   • Amazon SES (pay-per-use)');
  
  console.log('\n🔧 IMMEDIATE FIXES:');
  console.log('');
  console.log('FOR TESTING (Right Now):');
  console.log('1. Use onboarding@resend.dev as sender');
  console.log('2. Test with non-Gmail addresses');
  console.log('3. Update your .env.local:');
  console.log('   NODE_ENV=development');
  console.log('');
  console.log('FOR PRODUCTION:');
  console.log('1. Verify djmixandmingle.com domain in Resend');
  console.log('2. Add required DNS records');
  console.log('3. Wait for verification');
  console.log('4. Update NODE_ENV=production');
  
  console.log('\n🧪 TEST COMMANDS:');
  console.log('');
  console.log('# Test with sandbox domain');
  console.log('curl -X POST http://localhost:3000/api/test-email \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"email":"test@example.com"}\'');
  console.log('');
  console.log('# Test signup with sandbox');
  console.log('curl -X POST http://localhost:3000/api/auth/signup \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"email":"test@example.com","password":"Test123!"}\'');
  
  console.log('\n✅ Next Steps:');
  console.log('1. Set NODE_ENV=development in .env.local');
  console.log('2. Restart your app');
  console.log('3. Test with example.com emails');
  console.log('4. Set up domain verification for production');
}

testEmailWithSandbox().catch(console.error);
