/**
 * Account Creation Test Script
 * Run this in the browser console on the signup page to test account creation
 */

console.log('🧪 Account Creation Test Script Loaded');
console.log('📍 Make sure you are on: http://localhost:3006/signup');

// Test account creation function
async function testAccountCreation() {
  console.log('🚀 Starting account creation test...');
  
  // Generate a unique test email
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  const testUsername = `testuser${timestamp}`;
  
  console.log(`📧 Test Email: ${testEmail}`);
  console.log(`🔑 Test Password: ${testPassword}`);
  console.log(`👤 Test Username: ${testUsername}`);
  
  // Fill out the form
  try {
    // Wait for form elements to be available
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const usernameInput = document.querySelector('input[placeholder*="username" i]') || 
                         document.querySelector('input[name*="username" i]');
    
    if (!emailInput || !passwordInput) {
      console.error('❌ Could not find email or password input fields');
      return false;
    }
    
    // Fill the form
    emailInput.value = testEmail;
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = testPassword;
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    if (usernameInput) {
      usernameInput.value = testUsername;
      usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    console.log('✅ Form filled successfully');
    console.log('👆 Now click the Sign Up button to test the registration');
    
    return true;
  } catch (error) {
    console.error('❌ Error filling form:', error);
    return false;
  }
}

// Manual account creation checker
async function checkAccountCreationStatus() {
  console.log('🔍 Checking account creation status...');
  
  try {
    const response = await fetch('/api/check-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'check_recent_users'
      })
    });
    
    const result = await response.json();
    console.log('📊 Recent account status:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error checking account status:', error);
    return null;
  }
}

// Test email functionality
async function testEmailSystem() {
  console.log('📨 Testing email system...');
  
  try {
    const response = await fetch('/api/auth/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Account Creation Test Email',
        html: '<h1>✅ Email System Working</h1><p>This confirms your email system is functional.</p>'
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Email system is working!', result);
      return true;
    } else {
      console.error('❌ Email system error:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Email test failed:', error);
    return false;
  }
}

// Available commands
console.log(`
🎯 Available Test Commands:
1. testAccountCreation() - Fill the signup form with test data
2. checkAccountCreationStatus() - Check recent account creation status
3. testEmailSystem() - Test if email system is working

💡 Usage:
- Copy and paste these commands into the browser console
- Run testAccountCreation() first to fill the form
- Then manually click the Sign Up button
- Run checkAccountCreationStatus() to verify the account was created
`);

// Auto-run email test
testEmailSystem();
