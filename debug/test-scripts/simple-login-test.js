const fetch = require("node-fetch");

async function createTestCredentials() {
  const testEmail = `quicklogin-${Date.now()}@example.com`;
  const testPassword = "QuickLogin123!";

  console.log("🔐 Creating fresh test credentials for you...\n");

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: `quicktest${Date.now()}`,
      }),
    });

    const data = await response.json();

    if (response.ok && data.user) {
      console.log("✅ Test account created successfully!");
      console.log("📧 Email:", testEmail);
      console.log("🔑 Password:", testPassword);
      console.log("👤 User ID:", data.user.id);

      // Test the login immediately
      console.log("\n🔍 Testing login with these credentials...");

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

      if (loginResponse.ok) {
        console.log("✅ Backend login test: SUCCESS");
        console.log("👤 User:", loginData.user.email);
        console.log("🆔 ID:", loginData.user.id);

        console.log("\n🎯 NOW TEST IN YOUR BROWSER:");
        console.log("1. Go to: http://localhost:3000/login");
        console.log("2. Enter email:", testEmail);
        console.log("3. Enter password:", testPassword);
        console.log('4. Click "Sign In"');
        console.log("5. Open browser console (F12) and watch for messages");
        console.log("\n📋 WHAT TO LOOK FOR:");
        console.log(
          '- "🔐 Starting login process..." (should appear immediately)',
        );
        console.log('- "📧 Login result:" (should appear within 2-3 seconds)');
        console.log("- Redirect to dashboard or create-profile");
        console.log("\n🚨 IF IT DOESN'T WORK:");
        console.log("- Screenshot the browser console errors");
        console.log('- Try the green "🧪 Create & Login Test Account" button');
        console.log("- Check browser Network tab for failed requests");
      } else {
        console.log("❌ Backend login test: FAILED");
        console.log("Error:", loginData.error);
      }
    } else {
      console.log("❌ Failed to create test account:", data.error);
    }
  } catch (error) {
    console.log("💥 Error:", error.message);
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("- Make sure your dev server is running: npm run dev");
    console.log("- Check that localhost:3000 is accessible");
    console.log("- Try restarting your development server");
  }
}

createTestCredentials();
