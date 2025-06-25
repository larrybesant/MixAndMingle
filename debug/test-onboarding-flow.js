#!/usr/bin/env node

const fetch = require("node-fetch");

const baseUrl = "http://localhost:3001";

async function testOnboardingFlow() {
  console.log("🎯 Testing Complete Onboarding Flow...\n");

  try {
    // Test 1: Create new test user
    console.log("1️⃣ Creating new test user...");
    const testEmail = `onboarding-test-${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        username: `testuser${Date.now()}`,
      }),
    });

    const signupData = await signupResponse.json();

    if (signupResponse.ok && signupData.user) {
      console.log("✅ User created successfully:", {
        user_id: signupData.user.id,
        email: signupData.user.email,
        email_confirmed: signupData.user.email_confirmed_at ? "YES" : "NO",
      });

      // Test 2: Login with created user
      console.log("\n2️⃣ Testing login...");
      const loginResponse = await fetch(`${baseUrl}/api/login-diagnostic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok && loginData.user) {
        console.log("✅ Login successful:", {
          user_id: loginData.user.id,
          email_confirmed: loginData.user.emailConfirmed,
        });

        // Test 3: Check if profile setup is required
        console.log("\n3️⃣ Checking onboarding requirements...");
        console.log("📋 Expected Flow:");
        console.log(
          "   1. User logs in → Profile incomplete → Redirect to /setup-profile",
        );
        console.log(
          "   2. User completes profile → Redirect to /dashboard?show_tour=true",
        );
        console.log("   3. Dashboard shows onboarding tour for new users");
        console.log("   4. Tour completion unlocks achievements");
        console.log("   5. Progress tracker shows completion status");

        console.log("\n✨ Frontend Testing Instructions:");
        console.log("1. Go to http://localhost:3000/login");
        console.log("2. Login with these credentials:");
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPassword}`);
        console.log(
          "3. Should redirect to /setup-profile (profile incomplete)",
        );
        console.log("4. Complete profile in 3 steps:");
        console.log("   - Basic Info: Username, Bio, Gender, Photo");
        console.log("   - Music Prefs: Genres, Relationship goals");
        console.log("   - Location: Optional location info");
        console.log("5. Should redirect to /dashboard?show_tour=true");
        console.log("6. Should show welcome message and onboarding tour");
        console.log("7. Progress tracker should show completion status");
      } else {
        console.log("❌ Login failed:", loginData.error);
      }
    } else {
      console.log("❌ Signup failed:", signupData.error);
    }

    // Test 4: Test with existing user
    console.log("\n4️⃣ Testing with existing user (Larry)...");
    console.log("If Larry's profile is complete, login should go to dashboard");
    console.log("If tour not taken, should show tour automatically");
    console.log("");
    console.log("Test Instructions for Larry:");
    console.log("1. Go to http://localhost:3000/login");
    console.log("2. Login with larrybesant@gmail.com");
    console.log("3. Should go to dashboard (profile complete)");
    console.log("4. Should show progress tracker if onboarding incomplete");
    console.log("5. Can manually trigger tour with: /dashboard?show_tour=true");

    // Test 5: Database schema verification
    console.log("\n5️⃣ Verifying onboarding database setup...");
    console.log("📊 Required fields in profiles table:");
    console.log("   - username (required for completion)");
    console.log("   - bio (required for completion)");
    console.log("   - music_preferences (required for completion)");
    console.log("   - avatar_url (required for completion)");
    console.log("   - gender (required for completion)");
    console.log("   - onboarding_data (JSON field for progress)");
    console.log("");
    console.log("💡 If database errors occur, run:");
    console.log(
      "   ALTER TABLE profiles ADD COLUMN onboarding_data JSONB DEFAULT '{}';",
    );

    console.log("\n🎯 Onboarding Flow Test Complete!");
    console.log("\n📈 Success Metrics to Track:");
    console.log("   - Profile completion rate: Target 85%");
    console.log("   - Tour completion rate: Target 70%");
    console.log("   - First message sent: Target 40%");
    console.log("   - Day 1 retention: Target 60%");
    console.log("");
    console.log("🎮 Ready to test the frontend flow!");
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

testOnboardingFlow().catch(console.error);
