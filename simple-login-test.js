/**
 * 🔧 SIMPLE LOGIN TEST
 * Basic authentication test with client-side approach
 */

const { createClient } = require('@supabase/supabase-js');

// Use anon key for client-side authentication test
const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs'
);

async function simpleLoginTest() {
  console.log('🔧 SIMPLE LOGIN TEST');
  console.log('=' .repeat(30));
  
  const email = 'larrybesant@gmail.com';
  const password = 'MixMingle2024!';
  
  try {
    console.log('🔑 Attempting login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      
      // Common error solutions
      if (error.message.includes('Invalid login credentials')) {
        console.log('\n💡 POSSIBLE SOLUTIONS:');
        console.log('1. Password might be wrong');
        console.log('2. Account might not exist');
        console.log('3. Try creating account first');
        
        console.log('\n🆕 Creating account...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            console.log('✅ Account exists, but password is wrong');
            console.log('🔄 Try using a different password or reset it');
          } else {
            console.log('❌ Sign up failed:', signUpError.message);
          }
        } else {
          console.log('✅ Account created successfully!');
          console.log('📧 Check email for verification (if required)');
        }
        
      } else if (error.message.includes('Email not confirmed')) {
        console.log('\n📧 Email needs verification');
        console.log('Check your email for verification link');
      } else {
        console.log('\n❌ Unknown error:', error.message);
      }
      
    } else {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('🆔 User:', data.user.email);
      console.log('🎯 Session active');
      
      // Sign out for clean state
      await supabase.auth.signOut();
      console.log('📤 Signed out for testing');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Open browser dev tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Try logging in and check for errors');
  console.log('4. If no errors, try different browser/incognito mode');
}

simpleLoginTest();
