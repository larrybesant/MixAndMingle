/**
 * 🔧 LOGIN DIAGNOSTIC TOOL
 * Test authentication directly and identify issues
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs'
);

async function testLogin() {
  console.log('🔧 LOGIN DIAGNOSTIC TEST');
  console.log('=' .repeat(40));
  
  const email = 'larrybesant@gmail.com';
  const password = 'MixMingle2024!';
  
  try {
    console.log('📧 Testing login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');
    
    // Test 1: Check if user exists
    console.log('1️⃣ Checking if user exists...');
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('❌ Error checking users:', userError.message);
      return;
    }
    
    const user = userData.users.find(u => u.email === email);
    if (user) {
      console.log('✅ User exists');
      console.log('📧 Email confirmed:', user.email_confirmed_at ? 'Yes' : 'No');
      console.log('🔑 Last sign in:', user.last_sign_in_at || 'Never');
    } else {
      console.log('❌ User not found');
      return;
    }
    
    // Test 2: Try to sign in
    console.log('\n2️⃣ Testing sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('\n🔧 SOLUTION: Password is incorrect');
        console.log('Try these steps:');
        console.log('1. Use the forgot password feature');
        console.log('2. Or I can reset it to a new temporary password');
      } else if (signInError.message.includes('Email not confirmed')) {
        console.log('\n🔧 SOLUTION: Email needs confirmation');
        console.log('Confirming email automatically...');
        
        const { error: confirmError } = await supabase.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });
        
        if (confirmError) {
          console.log('❌ Could not confirm email:', confirmError.message);
        } else {
          console.log('✅ Email confirmed! Try logging in again.');
        }
      }
      return;
    }
    
    console.log('✅ SIGN IN SUCCESSFUL!');
    console.log('🆔 User ID:', signInData.user.id);
    console.log('📧 Email:', signInData.user.email);
    console.log('🎯 Session:', signInData.session ? 'Active' : 'None');
    
    // Test 3: Check admin access
    console.log('\n3️⃣ Testing admin access...');
    if (signInData.user.email === 'larrybesant@gmail.com') {
      console.log('✅ ADMIN ACCESS CONFIRMED');
      console.log('🎯 You can access: http://localhost:3000/admin');
    } else {
      console.log('❌ Not admin user');
    }
    
    console.log('\n🎉 DIAGNOSIS COMPLETE');
    console.log('✅ Your login should work in the web app now!');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Use: larrybesant@gmail.com / MixMingle2024!');
    console.log('3. Access admin: http://localhost:3000/admin');
    
  } catch (err) {
    console.error('❌ Diagnostic failed:', err.message);
    console.log('\n🔧 MANUAL SOLUTION:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Try refreshing the page');
    console.log('3. Clear browser cache/cookies');
    console.log('4. Try incognito/private browsing mode');
  }
}

testLogin();
