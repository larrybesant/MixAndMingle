/**
 * Frontend Login Test
 *
 * This simulates exactly what happens when you click "Sign In" in the browser
 */

const fetch = require("node-fetch");

async function testFrontendLogin() {
  console.log("🔍 FRONTEND LOGIN TEST\n");

  // Step 1: Create a fresh test account
  console.log("1️⃣ Creating test account...");
  const testEmail = `frontend-test-${Date.now()}@example.com`;
  const testPassword = "FrontendTest123!";

  try {
    const signupResponse = await fetch(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          username: `frontendtest${Date.now()}`,
        }),
      },
    );

    const signupData = await signupResponse.json();
    console.log("✅ Account created:", {
      success: signupResponse.ok,
      user_id: signupData.user?.id,
      email: signupData.user?.email,
      confirmed: signupData.user?.email_confirmed_at ? "YES" : "NO",
    });

    if (!signupResponse.ok) {
      console.log("❌ Cannot test login without successful signup");
      return;
    }

    // Step 2: Test the exact login flow that happens in the frontend
    console.log("\n2️⃣ Testing frontend login flow...");

    // Simulate what the frontend does:
    // 1. Get Supabase config
    const fs = require("fs");
    const envContent = fs.readFileSync(".env.local", "utf8");
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);

    if (!urlMatch || !keyMatch) {
      console.log("❌ Missing Supabase config in .env.local");
      return;
    }

    const supabaseUrl = urlMatch[1].trim();
    const supabaseKey = keyMatch[1].trim();

    console.log("🔧 Using Supabase config:", {
      url: supabaseUrl,
      key_length: supabaseKey.length,
    });

    // 2. Make the same auth request the frontend makes
    const loginResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      },
    );

    const loginData = await loginResponse.json();

    console.log("🔐 Login attempt result:", {
      status: loginResponse.status,
      success: loginResponse.ok,
      has_access_token: !!loginData.access_token,
      has_user: !!loginData.user,
      user_email: loginData.user?.email,
      user_confirmed: loginData.user?.email_confirmed_at ? "YES" : "NO",
      error_message: loginData.error?.message || loginData.error_description,
      full_error: loginData.error,
    });

    // Step 3: Test common error scenarios
    console.log("\n3️⃣ Testing error scenarios...");

    // Wrong password
    const wrongPasswordResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          email: testEmail,
          password: "wrongpassword123",
        }),
      },
    );

    const wrongPasswordData = await wrongPasswordResponse.json();
    console.log("🔑 Wrong password test:", {
      status: wrongPasswordResponse.status,
      error:
        wrongPasswordData.error?.message || wrongPasswordData.error_description,
    });

    // Non-existent user
    const noUserResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "anypassword",
        }),
      },
    );

    const noUserData = await noUserResponse.json();
    console.log("👤 Non-existent user test:", {
      status: noUserResponse.status,
      error: noUserData.error?.message || noUserData.error_description,
    });
  } catch (error) {
    console.log("💥 Test failed:", error.message);
  }

  console.log("\n📋 TROUBLESHOOTING GUIDE:");
  console.log("If you can't sign in, check:");
  console.log("1. ✅ Are you using the correct email and password?");
  console.log("2. ✅ Did you create the account successfully?");
  console.log("3. ✅ Is email verification required but not completed?");
  console.log("4. ✅ Are there any browser console errors?");
  console.log("5. ✅ Try clearing browser cache/localStorage");
  console.log("6. ✅ Check if caps lock is on");
  console.log("7. ✅ Try incognito/private browsing mode");

  console.log("\n✅ Frontend login test complete!");
}

testFrontendLogin().catch(console.error);
