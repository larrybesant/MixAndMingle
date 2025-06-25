/**
 * Frontend Login Diagnostic Test
 *
 * This script simulates the login process that happens in the browser
 * to identify specific issues with user authentication.
 */

// First, let's create a test user via the signup API if needed
async function createTestUser() {
  const testEmail = `logintest-${Date.now()}@example.com`;
  const testPassword = "TestLogin123!";
  const testUsername = `logintest${Date.now()}`;

  console.log("🔨 Creating test user for login testing...");

  try {
    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: testUsername,
      }),
    });

    const data = await response.json();

    if (response.ok && data.user) {
      console.log("✅ Test user created successfully:", {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at ? "YES" : "NO",
      });

      return { email: testEmail, password: testPassword, user: data.user };
    } else {
      console.log("❌ Failed to create test user:", data.error);
      return null;
    }
  } catch (error) {
    console.log("💥 Error creating test user:", error.message);
    return null;
  }
}

// Test direct Supabase login (simulating frontend)
async function testDirectSupabaseLogin(email, password) {
  console.log("\n🔐 Testing direct Supabase login...");

  // We need to simulate what happens in the browser
  // Let's use curl to make the same request the frontend would make
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://ywfjmsbyksehjgwalqum.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    console.log(
      "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - checking .env.local...",
    );

    const fs = require("fs");
    try {
      const envContent = fs.readFileSync(".env.local", "utf8");
      const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
      if (keyMatch) {
        console.log("✅ Found Supabase key in .env.local");
        return testWithSupabaseKey(email, password, keyMatch[1].trim());
      } else {
        console.log("❌ Supabase key not found in .env.local");
        return;
      }
    } catch (error) {
      console.log("❌ Could not read .env.local:", error.message);
      return;
    }
  }

  return testWithSupabaseKey(email, password, supabaseKey);
}

async function testWithSupabaseKey(email, password, supabaseKey) {
  const supabaseUrl = "https://ywfjmsbyksehjgwalqum.supabase.co";

  try {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
          apikey: supabaseKey,
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      },
    );

    const data = await response.json();

    console.log("🔑 Supabase login response:", {
      status: response.status,
      ok: response.ok,
      has_access_token: !!data.access_token,
      has_user: !!data.user,
      error: data.error?.message || data.error_description,
      user_email: data.user?.email,
      user_confirmed: data.user?.email_confirmed_at ? "YES" : "NO",
    });

    return { success: response.ok, data, error: data.error };
  } catch (error) {
    console.log("💥 Direct Supabase login failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Test common login scenarios
async function testLoginScenarios() {
  console.log("🧪 Testing common login scenarios...\n");

  // Scenario 1: Create and login with new user
  const testUser = await createTestUser();

  if (testUser) {
    // Test login immediately after signup
    await testDirectSupabaseLogin(testUser.email, testUser.password);

    // Test wrong password
    console.log("\n🔑 Testing wrong password...");
    await testDirectSupabaseLogin(testUser.email, "wrongpassword");
  }

  // Scenario 2: Test with non-existent user
  console.log("\n👤 Testing non-existent user...");
  await testDirectSupabaseLogin("nonexistent@example.com", "anypassword");

  // Scenario 3: Check if there are existing users we can test with
  console.log("\n👥 Checking for existing users...");
  await checkExistingUsers();
}

async function checkExistingUsers() {
  try {
    // This won't work directly, but let's see what happens
    const response = await fetch("http://localhost:3000/api/auth/users", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log("Existing users check:", {
      status: response.status,
      accessible: response.ok,
    });
  } catch (error) {
    console.log("Cannot check existing users directly (expected)");
  }
}

// Main diagnostic function
async function diagnoseLoginIssues() {
  console.log("🔍 LOGIN DIAGNOSTIC STARTING...\n");
  console.log("This will test the login functionality and identify issues.\n");

  // Check environment
  console.log("🌍 Environment check:");
  console.log("- Node version:", process.version);
  console.log("- Current directory:", process.cwd());

  // Test scenarios
  await testLoginScenarios();

  console.log("\n📋 COMMON LOGIN ISSUES & SOLUTIONS:");
  console.log(
    "1. Email not confirmed: Check if email verification is required",
  );
  console.log("2. Wrong credentials: Double-check email and password");
  console.log(
    "3. User not found: Make sure the account was created successfully",
  );
  console.log("4. Session issues: Clear browser storage and try again");
  console.log("5. Environment variables: Check Supabase URL and keys");

  console.log("\n✅ Login diagnostic complete!");
}

// Run the diagnostic
diagnoseLoginIssues().catch(console.error);
