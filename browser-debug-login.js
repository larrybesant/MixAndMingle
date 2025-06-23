// Browser debugging script - paste this in browser console on login page

console.log('🔧 Browser Login Debugger Active');

// Override the login function to add more debugging
if (window.location.pathname === '/login') {
  console.log('✅ On login page - setting up debugging');
  
  // Check environment variables
  console.log('🌐 Environment check:');
  console.log('- Origin:', window.location.origin);
  console.log('- Supabase available:', typeof window.supabase !== 'undefined');
  
  // Test network connectivity
  console.log('🔗 Testing API connectivity...');
  fetch('/api/check-email-verification')
    .then(r => r.json())
    .then(data => console.log('✅ API test:', data))
    .catch(err => console.log('❌ API test failed:', err));
  
  // Create manual login test function
  window.testLogin = async function(email, password) {
    console.log('🧪 Manual login test starting...');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    
    try {
      // Test 1: Direct Supabase client
      if (window.supabase) {
        console.log('🔐 Testing direct Supabase login...');
        const { error, data } = await window.supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password
        });
        
        console.log('Supabase result:', {
          error: error?.message,
          userId: data?.user?.id,
          hasSession: !!data?.session
        });
        
        if (error) {
          console.log('❌ Supabase login failed:', error.message);
        } else {
          console.log('✅ Supabase login successful!');
        }
      } else {
        console.log('❌ Supabase client not available');
      }
      
      // Test 2: Backend API
      console.log('🔍 Testing backend API...');
      const response = await fetch('/api/login-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const apiData = await response.json();
      console.log('Backend API result:', {
        success: response.ok,
        error: apiData.error,
        userId: apiData.user?.id
      });
      
    } catch (error) {
      console.log('💥 Manual test error:', error);
    }
  };
  
  // Auto-test with the fresh credentials
  setTimeout(() => {
    console.log('🎯 Auto-testing with fresh credentials...');
    window.testLogin('quicklogin-1750635269693@example.com', 'QuickLogin123!');
  }, 2000);
  
  console.log('🎮 MANUAL COMMANDS AVAILABLE:');
  console.log('- testLogin("email", "password") - Test login manually');
  console.log('- window.supabase.auth.getUser() - Check current user');
  console.log('- window.supabase.auth.getSession() - Check current session');
  
} else {
  console.log('❌ Not on login page. Navigate to /login first.');
}
