// 🔍 EMAIL DELIVERY DIAGNOSTIC SCRIPT
console.log('🔍 EMAIL DELIVERY DIAGNOSTIC');
console.log('============================');
console.log('');

const http = require('http');

function testEmailDelivery() {
  console.log('Testing password reset email to: larrybesant@gmail.com');
  console.log('');

  const postData = JSON.stringify({
    email: 'larrybesant@gmail.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/reset-password',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📡 Response Status:', res.statusCode);
      console.log('📦 Raw Response:', data);
      console.log('');
      
      try {
        const response = JSON.parse(data);
        
        if (response.success) {
          console.log('✅ EMAIL SEND SUCCESS!');
          console.log('📧 Provider used:', response.provider || 'Supabase built-in');
          console.log('');
          console.log('🔍 CHECK YOUR GMAIL NOW:');
          console.log('========================');
          console.log('');
          console.log('1. 📧 Open Gmail: https://gmail.com');
          console.log('2. 🗑️ Check SPAM folder (click "Spam" in sidebar)');
          console.log('3. 📊 Check Promotions tab');
          console.log('4. 👥 Check Social tab');
          console.log('5. 🔍 Search Gmail for: "password reset"');
          console.log('6. 🔍 Search Gmail for: "mixandmingle"');
          console.log('');
          console.log('⏰ Emails can take 1-5 minutes to arrive');
          console.log('');
          
          if (response.directResetUrl) {
            console.log('🚀 BACKUP OPTION - Direct Reset Link:');
            console.log('If email doesn\'t arrive, use this direct link:');
            console.log(response.directResetUrl);
            console.log('');
          }
          
        } else {
          console.log('❌ EMAIL SEND FAILED');
          console.log('Error:', response.error);
          console.log('');
          
          if (response.error && response.error.includes('rate limit')) {
            console.log('⏰ Rate limited - wait 5 minutes before trying again');
          } else if (response.error && response.error.includes('SMTP')) {
            console.log('📧 SMTP configuration issue in Supabase');
          }
        }
        
      } catch (parseError) {
        console.log('❌ Failed to parse response as JSON');
        console.log('Raw response:', data);
      }
      
      console.log('');
      console.log('🔧 TO FIX EMAIL DELIVERY PERMANENTLY:');
      console.log('====================================');
      console.log('');
      console.log('Current: Using Supabase built-in email (unreliable)');
      console.log('Solution: Set up Resend for professional email delivery');
      console.log('');
      console.log('Steps:');
      console.log('1. Visit https://resend.com and sign up (free)');
      console.log('2. Create an API key');
      console.log('3. Add to .env.local: RESEND_KEY=your_key_here');
      console.log('4. Restart your app');
      console.log('');
      console.log('This will give you:');
      console.log('✅ Reliable delivery to Gmail');
      console.log('✅ Professional branded emails');
      console.log('✅ Delivery analytics');
      console.log('✅ Better spam avoidance');
      console.log('');
    });
  });

  req.on('error', (error) => {
    console.log('❌ Connection Error:', error.message);
    console.log('');
    console.log('Make sure your Next.js app is running:');
    console.log('npm run dev');
    console.log('');
    console.log('Then run this script again:');
    console.log('node email-diagnostic.js');
  });

  req.write(postData);
  req.end();
}

// Run the test
testEmailDelivery();
