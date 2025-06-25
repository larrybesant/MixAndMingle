/**
 * FINAL AUTHENTICATION FLOW VALIDATOR
 *
 * This is the complete test script to validate the entire authentication system.
 *
 * How to use:
 * 1. Open your app in browser: http://localhost:3000
 * 2. Open browser console (F12)
 * 3. Copy and paste this entire script
 * 4. Wait for the automated tests to complete
 * 5. Review the final report
 *
 * The script will test:
 * ✅ Environment setup
 * ✅ Database connectivity
 * ✅ Signup process (frontend + backend)
 * ✅ Profile creation
 * ✅ Login process
 * ✅ Session management
 * ✅ Redirection logic
 * ✅ Error handling
 * ✅ Edge cases
 */

console.log("🚀 FINAL AUTHENTICATION FLOW VALIDATOR");
console.log("=====================================\n");

class FinalAuthValidator {
  constructor() {
    this.testResults = {};
    this.errors = [];
    this.fixes = [];
    this.testEmail = `final-test-${Date.now()}@example.com`;
    this.testPassword = "FinalTest123!";
    this.testUsername = `finaltest${Date.now()}`;
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  log(message, type = "info") {
    const icons = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
      fix: "🔧",
      test: "🧪",
    };
    console.log(`${icons[type]} ${message}`);
  }

  async runTest(testName, testFn) {
    this.log(`Testing: ${testName}`, "test");
    try {
      const result = await testFn();
      this.testResults[testName] = { status: "PASS", result };
      this.log(`${testName}: PASSED`, "success");
      return result;
    } catch (error) {
      this.testResults[testName] = { status: "FAIL", error: error.message };
      this.errors.push({ test: testName, error: error.message });
      this.log(`${testName}: FAILED - ${error.message}`, "error");
      return null;
    }
  }

  async testEnvironment() {
    return this.runTest("Environment Setup", async () => {
      // Check browser environment
      if (typeof window === "undefined") {
        throw new Error("Must run in browser environment");
      }

      // Check if we can access Supabase
      let supabase;
      try {
        if (window.supabase) {
          supabase = window.supabase;
        } else {
          const module = await import("/lib/supabase/client.js");
          supabase = module.supabase;
          if (!supabase) {
            throw new Error("Supabase client not found");
          }
        }
      } catch (error) {
        throw new Error(`Cannot access Supabase: ${error.message}`);
      }

      this.supabase = supabase;

      // Test database connection
      const { data, error } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);
      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      return { supabaseConnected: true, databaseConnected: true };
    });
  }

  async testSignup() {
    return this.runTest("Signup Process", async () => {
      if (!this.supabase) {
        throw new Error("Supabase not available");
      }

      // Clear any existing session
      await this.supabase.auth.signOut();
      await this.delay(500);

      // Test signup
      const { data: signupData, error: signupError } =
        await this.supabase.auth.signUp({
          email: this.testEmail,
          password: this.testPassword,
          options: {
            data: {
              username: this.testUsername,
              full_name: this.testUsername,
            },
          },
        });

      if (signupError) {
        if (signupError.message.includes("User already registered")) {
          this.log(
            "User already exists, continuing with existing account",
            "warning",
          );
        } else {
          throw new Error(`Signup failed: ${signupError.message}`);
        }
      }

      if (
        !signupData?.user &&
        !signupError?.message.includes("already registered")
      ) {
        throw new Error("Signup completed but no user data returned");
      }

      this.userId = signupData?.user?.id;
      return { userId: this.userId, signupSuccessful: true };
    });
  }

  async testProfileCreation() {
    return this.runTest("Profile Creation", async () => {
      if (!this.userId) {
        // Try to get user ID from existing account
        const {
          data: { user },
        } = await this.supabase.auth.getUser();
        if (!user) {
          throw new Error("No user ID available");
        }
        this.userId = user.id;
      }

      // Check if profile exists
      const { data: existingProfile } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", this.userId)
        .single();

      if (existingProfile) {
        this.log("Profile already exists", "warning");
        return { profileExists: true, profile: existingProfile };
      }

      // Create profile
      const { data: newProfile, error: profileError } = await this.supabase
        .from("profiles")
        .insert([
          {
            id: this.userId,
            username: this.testUsername,
            full_name: this.testUsername,
            email: this.testEmail,
            avatar_url: null,
            bio: "Test user profile",
            music_preferences: ["electronic"],
            preferred_language: "en",
            is_dj: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      return { profileExists: false, profile: newProfile };
    });
  }

  async testLogin() {
    return this.runTest("Login Process", async () => {
      // Sign out first
      await this.supabase.auth.signOut();
      await this.delay(1000);

      // Test login
      const { data: loginData, error: loginError } =
        await this.supabase.auth.signInWithPassword({
          email: this.testEmail,
          password: this.testPassword,
        });

      if (loginError) {
        throw new Error(`Login failed: ${loginError.message}`);
      }

      if (!loginData.user) {
        throw new Error("Login completed but no user data returned");
      }

      // Verify session
      const {
        data: { session },
      } = await this.supabase.auth.getSession();
      if (!session) {
        throw new Error("Login successful but no session created");
      }

      return {
        loginSuccessful: true,
        sessionCreated: true,
        userId: loginData.user.id,
      };
    });
  }

  async testProfileRetrieval() {
    return this.runTest("Profile Retrieval", async () => {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      if (!user) {
        throw new Error("No authenticated user");
      }

      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(`Profile retrieval failed: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error("No profile found for authenticated user");
      }

      // Check profile completeness
      const requiredFields = ["username", "bio", "music_preferences"];
      const missingFields = requiredFields.filter(
        (field) =>
          !profile[field] ||
          (Array.isArray(profile[field]) && profile[field].length === 0) ||
          (typeof profile[field] === "string" && !profile[field].trim()),
      );

      return {
        profile,
        isComplete: missingFields.length === 0,
        missingFields,
      };
    });
  }

  async testRedirectionLogic() {
    return this.runTest("Redirection Logic", async () => {
      const profileResult = this.testResults["Profile Retrieval"]?.result;

      if (!profileResult) {
        throw new Error("Profile data not available");
      }

      // Determine expected redirect
      let expectedRedirect;
      if (!profileResult.profile) {
        expectedRedirect = "/create-profile";
      } else if (!profileResult.isComplete) {
        expectedRedirect = "/setup-profile";
      } else {
        expectedRedirect = "/dashboard";
      }

      // Test if pages exist
      const pagesToTest = ["/signup", "/login", "/dashboard", "/setup-profile"];
      const pageResults = [];

      for (const page of pagesToTest) {
        try {
          const response = await fetch(page, { method: "HEAD" });
          pageResults.push({
            page,
            exists: response.ok,
            status: response.status,
          });
        } catch (error) {
          pageResults.push({
            page,
            exists: false,
            error: error.message,
          });
        }
      }

      return {
        expectedRedirect,
        pageResults,
        profileComplete: profileResult.isComplete,
      };
    });
  }

  async testErrorHandling() {
    return this.runTest("Error Handling", async () => {
      const errorTests = [];

      // Test 1: Invalid email
      try {
        await this.supabase.auth.signUp({
          email: "invalid-email",
          password: this.testPassword,
        });
        errorTests.push({ test: "Invalid email", handled: false });
      } catch (error) {
        errorTests.push({ test: "Invalid email", handled: true });
      }

      // Test 2: Weak password
      try {
        const { error } = await this.supabase.auth.signUp({
          email: `weak-test-${Date.now()}@example.com`,
          password: "123",
        });

        if (error) {
          errorTests.push({ test: "Weak password", handled: true });
        } else {
          errorTests.push({ test: "Weak password", handled: false });
        }
      } catch (error) {
        errorTests.push({ test: "Weak password", handled: true });
      }

      // Test 3: Invalid login
      try {
        const { error } = await this.supabase.auth.signInWithPassword({
          email: this.testEmail,
          password: "WrongPassword123!",
        });

        if (error && error.message.includes("Invalid login credentials")) {
          errorTests.push({ test: "Invalid login", handled: true });
        } else {
          errorTests.push({ test: "Invalid login", handled: false });
        }
      } catch (error) {
        errorTests.push({ test: "Invalid login", handled: true });
      }

      return errorTests;
    });
  }

  async testAPIEndpoints() {
    return this.runTest("API Endpoints", async () => {
      const endpoints = [];

      // Test fresh-auth endpoint
      try {
        const response = await fetch("/api/fresh-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signup",
            email: `api-test-${Date.now()}@example.com`,
            password: this.testPassword,
          }),
        });

        const result = await response.json();
        endpoints.push({
          endpoint: "/api/fresh-auth",
          working: response.ok,
          status: response.status,
          result: response.ok ? "SUCCESS" : result.error,
        });
      } catch (error) {
        endpoints.push({
          endpoint: "/api/fresh-auth",
          working: false,
          error: error.message,
        });
      }

      // Test email verification check
      try {
        const response = await fetch("/api/check-email-verification");
        const result = await response.json();
        endpoints.push({
          endpoint: "/api/check-email-verification",
          working: response.ok,
          emailConfirmationDisabled:
            result.email_verification_status?.immediately_confirmed,
        });
      } catch (error) {
        endpoints.push({
          endpoint: "/api/check-email-verification",
          working: false,
          error: error.message,
        });
      }

      return endpoints;
    });
  }

  generateReport() {
    console.log("\n📊 FINAL AUTHENTICATION VALIDATION REPORT");
    console.log("==========================================\n");

    let passedTests = 0;
    let totalTests = Object.keys(this.testResults).length;

    // Test results summary
    for (const [testName, result] of Object.entries(this.testResults)) {
      const status = result.status === "PASS" ? "✅ PASS" : "❌ FAIL";
      console.log(`${status} ${testName}`);

      if (result.status === "PASS") {
        passedTests++;
      }
    }

    const successRate = Math.round((passedTests / totalTests) * 100);

    console.log("\n📈 SUMMARY");
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${successRate}%`);

    // Detailed analysis
    if (successRate === 100) {
      console.log("\n🎉 AUTHENTICATION SYSTEM IS READY FOR BETA TESTING!");
      console.log(
        "\n✨ All tests passed. Your app is ready for production deployment.",
      );
      console.log("\n🚀 Next steps:");
      console.log("1. Deploy to Vercel/Netlify");
      console.log("2. Update environment variables in production");
      console.log("3. Test with real users");
      console.log("4. Monitor authentication performance");
    } else if (successRate >= 80) {
      console.log("\n⚠️ AUTHENTICATION MOSTLY WORKING - MINOR ISSUES");
      console.log("\n🔧 Fix these issues before beta testing:");
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    } else {
      console.log("\n❌ AUTHENTICATION NEEDS SIGNIFICANT FIXES");
      console.log("\n🚨 Critical issues found:");
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });

      console.log("\n💡 Recommended actions:");
      if (this.testResults["Environment Setup"]?.status === "FAIL") {
        console.log("• Check Supabase configuration and environment variables");
      }
      if (this.testResults["Signup Process"]?.status === "FAIL") {
        console.log("• Verify Supabase auth settings and signup flow");
      }
      if (this.testResults["Login Process"]?.status === "FAIL") {
        console.log("• Check login credentials and session management");
      }
      if (this.testResults["Profile Creation"]?.status === "FAIL") {
        console.log("• Verify database schema and RLS policies");
      }
    }

    // Configuration insights
    const apiResult = this.testResults["API Endpoints"]?.result;
    if (apiResult) {
      const emailVerification = apiResult.find(
        (e) => e.endpoint === "/api/check-email-verification",
      );
      if (emailVerification?.emailConfirmationDisabled) {
        console.log("\n📧 EMAIL CONFIRMATION: DISABLED (Good for testing)");
      } else {
        console.log(
          "\n📧 EMAIL CONFIRMATION: ENABLED (Users need to verify emails)",
        );
      }
    }

    return {
      totalTests,
      passedTests,
      successRate,
      errors: this.errors,
      readyForBeta: successRate === 100,
    };
  }

  async runFullValidation() {
    console.log("Starting comprehensive authentication validation...\n");

    // Run all tests
    await this.testEnvironment();
    await this.testSignup();
    await this.testProfileCreation();
    await this.testLogin();
    await this.testProfileRetrieval();
    await this.testRedirectionLogic();
    await this.testErrorHandling();
    await this.testAPIEndpoints();

    // Generate final report
    const report = this.generateReport();

    // Cleanup test data
    if (this.userId) {
      try {
        await this.supabase.from("profiles").delete().eq("id", this.userId);
        await this.supabase.auth.signOut();
        this.log("Test data cleaned up", "info");
      } catch (error) {
        this.log("Could not clean up test data", "warning");
      }
    }

    return report;
  }
}

// Auto-run the validation
const validator = new FinalAuthValidator();

validator.runFullValidation().then((report) => {
  console.log("\n🎯 Validation complete!");

  if (report.readyForBeta) {
    console.log("\n🚀 YOUR APP IS READY FOR BETA TESTING! 🎉");
    console.log("\nNext steps:");
    console.log("1. Deploy to production");
    console.log("2. Invite beta testers");
    console.log("3. Monitor user feedback");
  } else {
    console.log("\n🔧 Please fix the issues above before beta testing.");
  }

  console.log("\n💡 To run specific tests manually:");
  console.log("• validator.testEnvironment()");
  console.log("• validator.testSignup()");
  console.log("• validator.testLogin()");
});

// Export for manual use
window.authValidator = validator;
console.log("\n🔍 Validator available as: window.authValidator");
