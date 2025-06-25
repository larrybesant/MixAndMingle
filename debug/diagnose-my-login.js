/**
 * Personal Login Diagnostic Tool
 *
 * This will help diagnose your specific login issue
 */

const fetch = require("node-fetch");

async function diagnoseYourLogin() {
  console.log("🔍 PERSONAL LOGIN DIAGNOSTIC\n");

  // Step 1: Test system configuration
  console.log("1️⃣ Testing system configuration...");
  try {
    const configResponse = await fetch(
      "http://localhost:3000/api/login-diagnostic",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      },
    );

    const configData = await configResponse.json();
    console.log("✅ System config:", {
      supabase_connected: configResponse.ok,
      supabase_url: configData.config?.supabaseUrl,
      key_length: configData.config?.keyLength,
    });
  } catch (error) {
    console.log("❌ System config test failed:", error.message);
  }

  // Step 2: Test creating a fresh account and logging in
  console.log("\n2️⃣ Testing fresh account creation and login...");
  const testEmail = `personal-test-${Date.now()}@example.com`;
  const testPassword = "PersonalTest123!";

  try {
    // Create account
    const signupResponse = await fetch(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          username: `personaltest${Date.now()}`,
        }),
      },
    );

    const signupData = await signupResponse.json();
    console.log("📝 Fresh account created:", {
      success: signupResponse.ok,
      user_id: signupData.user?.id,
      email: signupData.user?.email,
      confirmed: signupData.user?.email_confirmed_at ? "YES" : "NO",
    });

    if (signupResponse.ok) {
      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test login
      const loginResponse = await fetch(
        "http://localhost:3000/api/login-diagnostic",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: testEmail,
            password: testPassword,
          }),
        },
      );

      const loginData = await loginResponse.json();
      console.log("🔐 Fresh account login test:", {
        success: loginResponse.ok,
        user_id: loginData.user?.id,
        error: loginData.error,
        suggestion: loginData.suggestion,
      });
    }
  } catch (error) {
    console.log("❌ Fresh account test failed:", error.message);
  }

  // Step 3: Instructions for testing your actual credentials
  console.log("\n3️⃣ TESTING YOUR ACTUAL CREDENTIALS");
  console.log("=".repeat(50));
  console.log("To test your actual login credentials, please:");
  console.log("");
  console.log("A) Edit this file and replace the placeholders below:");
  console.log('   const yourEmail = "YOUR_ACTUAL_EMAIL@example.com";');
  console.log('   const yourPassword = "YOUR_ACTUAL_PASSWORD";');
  console.log("");
  console.log("B) Or run this command in the terminal:");
  console.log("   curl -X POST http://localhost:3000/api/login-diagnostic \\");
  console.log('     -H "Content-Type: application/json" \\');
  console.log(
    '     -d \'{"email": "your-email@example.com", "password": "your-password"}\'',
  );
  console.log("");

  // You can uncomment and modify these lines to test with your actual credentials
  /*
  const yourEmail = "YOUR_ACTUAL_EMAIL@example.com";  // Replace with your email
  const yourPassword = "YOUR_ACTUAL_PASSWORD";        // Replace with your password
  
  console.log('4️⃣ Testing your actual credentials...');
  try {
    const response = await fetch('http://localhost:3000/api/login-diagnostic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: yourEmail,
        password: yourPassword
      })
    });
    
    const data = await response.json();
    console.log('🔐 Your login test result:', {
      success: response.ok,
      status: response.status,
      user_id: data.user?.id,
      user_email: data.user?.email,
      email_confirmed: data.user?.emailConfirmed,
      error: data.error,
      suggestion: data.suggestion
    });
    
    if (response.ok) {
      console.log('✅ SUCCESS: Your credentials work! The issue might be in the browser.');
      console.log('');
      console.log('BROWSER TROUBLESHOOTING:');
      console.log('1. Try opening the login page in incognito/private mode');
      console.log('2. Clear your browser cache and localStorage');
      console.log('3. Check the browser console (F12) for JavaScript errors');
      console.log('4. Try a different browser');
      console.log('5. Make sure JavaScript is enabled');
    } else {
      console.log('❌ ISSUE FOUND:', data.error);
      console.log('💡 SUGGESTION:', data.suggestion);
    }
  } catch (error) {
    console.log('❌ Your credentials test failed:', error.message);
  }
  */

  console.log("\n📋 COMMON LOGIN ISSUES CHECKLIST:");
  console.log("□ Did you create an account successfully?");
  console.log("□ Are you using the correct email address?");
  console.log("□ Are you using the correct password?");
  console.log("□ Is caps lock on?");
  console.log("□ Are there any browser console errors?");
  console.log("□ Have you tried incognito/private browsing?");
  console.log("□ Have you tried clearing browser cache?");
  console.log(
    '□ Are you clicking the "Sign In" button after entering credentials?',
  );
  console.log("□ Is the page responding when you click the button?");

  console.log("\n🧪 QUICK BROWSER TEST:");
  console.log("1. Go to http://localhost:3000/login");
  console.log('2. Click the "🧪 Create & Login Test Account" button');
  console.log("3. This will create a new account and login automatically");
  console.log(
    "4. If this works, your system is fine and the issue is with your specific credentials",
  );

  console.log("\n✅ Diagnostic complete!");
}

diagnoseYourLogin().catch(console.error);
