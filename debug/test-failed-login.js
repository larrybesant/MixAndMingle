const fetch = require("node-fetch");

async function testFailedCredentials() {
  console.log("🔍 Testing the credentials that failed in browser...\n");

  const testEmail = "quicklogin-1750634550053@example.com";
  const testPassword = "QuickLogin123!";

  try {
    console.log("📧 Email:", testEmail);
    console.log("🔑 Password length:", testPassword.length);

    // Test backend login
    const response = await fetch("http://localhost:3000/api/login-diagnostic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await response.json();

    console.log("\n🔐 Backend test result:");
    console.log("Status:", response.status);
    console.log("Success:", response.ok);
    console.log("User ID:", data.user?.id);
    console.log("Email:", data.user?.email);
    console.log("Email Confirmed:", data.user?.emailConfirmed);
    console.log("Error:", data.error);
    console.log("Suggestion:", data.suggestion);

    if (response.ok && data.user) {
      console.log("\n✅ BACKEND LOGIN WORKS!");
      console.log("🚨 FRONTEND ISSUE DETECTED");
      console.log("");
      console.log("🔍 POSSIBLE CAUSES:");
      console.log(
        "1. Frontend is using different Supabase client configuration",
      );
      console.log("2. Browser is caching old authentication state");
      console.log("3. Frontend login function has a bug");
      console.log("4. Environment variables not loaded in browser");
      console.log("");
      console.log("🛠️ DEBUG STEPS:");
      console.log("1. Clear browser cache and cookies");
      console.log("2. Try incognito/private browsing mode");
      console.log("3. Check browser console for Supabase errors");
      console.log("4. Verify NEXT_PUBLIC_SUPABASE_URL in browser");
    } else {
      console.log("\n❌ BACKEND ALSO FAILING");
      console.log("Issue:", data.error);
      console.log("");
      console.log("🔍 TROUBLESHOOTING:");
      console.log("1. Account may have been deleted");
      console.log("2. Password may have changed");
      console.log("3. Supabase configuration issue");

      // Let's create a fresh account
      console.log("\n🔧 Creating fresh test account...");
      const newEmail = `fresh-test-${Date.now()}@example.com`;
      const newPassword = "FreshTest123!";

      const signupResponse = await fetch(
        "http://localhost:3000/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: newEmail,
            password: newPassword,
            username: `fresh${Date.now()}`,
          }),
        },
      );

      const signupData = await signupResponse.json();

      if (signupData.success) {
        console.log("✅ Fresh account created!");
        console.log("📧 New Email:", newEmail);
        console.log("🔑 New Password:", newPassword);
        console.log("");
        console.log("🎯 TRY THESE CREDENTIALS IN BROWSER:");
        console.log("Email:", newEmail);
        console.log("Password:", newPassword);
      } else {
        console.log("❌ Failed to create fresh account:", signupData.error);
      }
    }
  } catch (error) {
    console.log("💥 Test failed:", error.message);
  }
}

testFailedCredentials();
