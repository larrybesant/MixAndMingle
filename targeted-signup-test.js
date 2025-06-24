/**
 * TARGETED SIGNUP FLOW TEST
 * 
 * Run this in browser console on the signup page
 * to test the complete signup -> profile creation -> login flow
 */

console.log('🧪 TESTING SIGNUP FLOW...\n');

async function testSignupFlow() {
  const testEmail = `signup-test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testUsername = `user${Date.now()}`;
  
  console.log('📝 Test credentials:');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  console.log(`Username: ${testUsername}`);
  console.log('');

  try {
    // Step 1: Fill the form programmatically
    console.log('1️⃣ Filling signup form...');
    
    const usernameInput = document.querySelector('input[placeholder*="username" i]');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    
    if (!usernameInput || !emailInput || !passwordInput) {
      throw new Error('Could not find form inputs. Make sure you are on the signup page.');
    }
    
    // Fill the inputs
    usernameInput.value = testUsername;
    emailInput.value = testEmail;
    passwordInput.value = testPassword;
    
    // Trigger change events
    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('✅ Form filled successfully');
    
    // Step 2: Submit the form
    console.log('2️⃣ Submitting signup form...');
    
    const submitButton = document.querySelector('button[type="submit"]') || 
                       document.querySelector('button:contains("Sign Up")') ||
                       document.querySelector('button:contains("Create Account")');
    
    if (!submitButton) {
      throw new Error('Could not find submit button');
    }
    
    // Click the submit button
    submitButton.click();
    
    console.log('✅ Form submitted, waiting for response...');
    
    // Wait and check for results
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Check for success or error messages
    console.log('3️⃣ Checking results...');
    
    const errorMessage = document.querySelector('[class*="error"]') || 
                        document.querySelector('[class*="red"]') ||
                        document.querySelector('div:contains("error")');
    
    const successMessage = document.querySelector('[class*="success"]') || 
                          document.querySelector('[class*="green"]') ||
                          document.querySelector('div:contains("✅")');
    
    if (errorMessage && errorMessage.textContent.trim()) {
      console.log('❌ Error found:', errorMessage.textContent.trim());
    }
    
    if (successMessage && successMessage.textContent.trim()) {
      console.log('✅ Success message:', successMessage.textContent.trim());
    }
    
    // Step 4: Check current URL
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Redirected to dashboard');
    } else if (currentUrl.includes('/setup-profile')) {
      console.log('✅ Redirected to profile setup');
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️ Redirected to login page');
    } else {
      console.log('⚠️ No redirect occurred');
    }
    
    // Step 5: Test the API directly
    console.log('4️⃣ Testing API directly...');
    
    const apiResponse = await fetch('/api/fresh-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'signup',
        email: `api-test-${Date.now()}@example.com`,
        password: testPassword
      })
    });
    
    const apiResult = await apiResponse.json();
    console.log('🔗 API Response:', apiResult);
    
    if (apiResponse.ok) {
      console.log('✅ API signup works');
    } else {
      console.log('❌ API signup failed:', apiResult.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

// Also test the login flow with an existing account
async function testLoginFlow() {
  console.log('\n🔐 TESTING LOGIN FLOW...\n');
  
  const testEmail = 'test@mixandmingle.app'; // Use a known test account
  const testPassword = 'TestPassword123!';
  
  try {
    // Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    window.location.href = '/login';
    
    // Wait for page load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill login form
    console.log('2️⃣ Filling login form...');
    
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    
    if (emailInput && passwordInput) {
      emailInput.value = testEmail;
      passwordInput.value = testPassword;
      
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      console.log('✅ Login form filled');
      
      // Submit
      const submitButton = document.querySelector('button:contains("Sign In")') ||
                          document.querySelector('button[type="submit"]');
      
      if (submitButton) {
        submitButton.click();
        console.log('✅ Login form submitted');
      }
    }
    
  } catch (error) {
    console.error('💥 Login test failed:', error.message);
  }
}

// Run the tests
console.log('🚀 Starting signup flow test...');
testSignupFlow();

// Provide manual controls
window.testSignupFlow = testSignupFlow;
window.testLoginFlow = testLoginFlow;

console.log('\n💡 Manual controls available:');
console.log('• testSignupFlow() - Test signup process');
console.log('• testLoginFlow() - Test login process');
