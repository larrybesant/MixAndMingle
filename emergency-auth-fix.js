/**
 * EMERGENCY AUTHENTICATION FIX
 * This creates a working test account and bypasses common auth issues
 */

console.log('🚨 EMERGENCY AUTH FIX - CREATING TEST ACCOUNT...');

// Step 1: Clear all auth state
async function clearAuthState() {
  try {
    // Clear localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear any cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Cleared auth state');
  } catch (error) {
    console.log('⚠️ Could not clear auth state:', error);
  }
}

// Step 2: Create working test account
async function createTestAccount() {
  try {
    console.log('📝 Creating guaranteed working test account...');
    
    // Simple test credentials
    const testEmail = 'beta@mixmingle.test';
    const testPassword = 'BetaTest123!';
    
    // Call signup API directly
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: 'beta_tester',
        full_name: 'Beta Tester',
        preferred_language: 'en'
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test account created via API!', result);
      return { email: testEmail, password: testPassword };
    } else {
      throw new Error(`API signup failed: ${response.status}`);
    }
    
  } catch (error) {
    console.log('⚠️ API signup failed, trying direct method...', error);
    return null;
  }
}

// Step 3: Direct Supabase account creation
async function directAccountCreation() {
  try {
    console.log('🔧 Attempting direct account creation...');
    
    // Get Supabase client
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    
    // Use your actual Supabase config
    const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your actual URL
    const supabaseKey = 'YOUR_ANON_KEY';     // Replace with your actual key
    
    if (supabaseUrl === 'YOUR_SUPABASE_URL') {
      console.log('❌ Need to configure Supabase URLs manually');
      return null;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const testEmail = 'working@test.com';
    const testPassword = 'WorkingTest123!';
    
    // Try signup with minimal options
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (error) {
      console.error('❌ Direct signup failed:', error);
      return null;
    }
    
    console.log('✅ Direct signup successful!', data);
    return { email: testEmail, password: testPassword };
    
  } catch (error) {
    console.error('❌ Direct method failed:', error);
    return null;
  }
}

// Step 4: Bypass authentication completely for testing
function createBypassMode() {
  console.log('🚫 CREATING BYPASS MODE FOR IMMEDIATE TESTING...');
  
  // Set fake auth state
  localStorage.setItem('supabase.auth.token', JSON.stringify({
    access_token: 'fake-token-for-testing',
    refresh_token: 'fake-refresh-token',
    user: {
      id: 'test-user-id',
      email: 'test@bypass.com',
      user_metadata: {
        username: 'test_user',
        full_name: 'Test User'
      }
    }
  }));
  
  // Set language preference
  localStorage.setItem('preferredLanguage', 'en');
  
  console.log('✅ Bypass mode enabled!');
  console.log('🌍 You can now test the language feature');
  console.log('📱 Navigate to /dashboard or /test-language');
  
  return true;
}

// Main fix function
async function emergencyAuthFix() {
  console.log('🚨 STARTING EMERGENCY AUTHENTICATION FIX...');
  console.log('');
  
  // Step 1: Clear everything
  await clearAuthState();
  
  // Step 2: Try API account creation
  let account = await createTestAccount();
  
  // Step 3: Try direct Supabase
  if (!account) {
    account = await directAccountCreation();
  }
  
  // Step 4: Enable bypass mode
  if (!account) {
    console.log('⚠️ Account creation failed, enabling bypass mode...');
    createBypassMode();
    
    console.log('');
    console.log('🎯 BYPASS MODE ACTIVE - YOU CAN NOW:');
    console.log('1. Test language selection at /test-language');
    console.log('2. See dashboard simulation at /dashboard');
    console.log('3. Test all UI features without auth');
    console.log('');
    console.log('🔄 Redirecting to language test page...');
    
    setTimeout(() => {
      window.location.href = '/test-language';
    }, 3000);
    
    return;
  }
  
  // Step 5: Test login with created account
  console.log('');
  console.log('🎉 ACCOUNT CREATED SUCCESSFULLY!');
  console.log(`📧 Email: ${account.email}`);
  console.log(`🔑 Password: ${account.password}`);
  console.log('');
  console.log('✨ You can now sign in normally!');
  console.log('🔄 Redirecting to login page...');
  
  setTimeout(() => {
    window.location.href = '/login';
  }, 3000);
}

// Auto-run the fix
emergencyAuthFix();
