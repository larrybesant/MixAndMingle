/**
 * AUTHENTICATION STATUS CHECKER & FIXER
 *
 * This script provides comprehensive diagnostics and fixes for authentication issues.
 * Run this in the browser console on localhost:3000
 */

class AuthStatusChecker {
  constructor() {
    this.supabase = null;
    this.init();
  }

  async init() {
    try {
      // Try to get Supabase client
      if (typeof window !== "undefined") {
        const { supabase } = await import("/lib/supabase/client");
        this.supabase = supabase;
        console.log("✅ Supabase client loaded");
      }
    } catch (error) {
      console.error("❌ Failed to load Supabase client:", error);
    }
  }

  async checkEnvironmentVariables() {
    console.log("\n🔍 CHECKING ENVIRONMENT VARIABLES...");

    const requiredVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    let allPresent = true;

    for (const varName of requiredVars) {
      const value = process.env[varName] || window.ENV?.[varName];
      if (!value) {
        console.error(`❌ Missing: ${varName}`);
        allPresent = false;
      } else {
        console.log(`✅ Present: ${varName} = ${value.substring(0, 20)}...`);
      }
    }

    return allPresent;
  }

  async checkSupabaseConnection() {
    console.log("\n📡 CHECKING SUPABASE CONNECTION...");

    if (!this.supabase) {
      console.error("❌ Supabase client not available");
      return false;
    }

    try {
      // Test basic query
      const { data, error } = await this.supabase
        .from("profiles")
        .select("count")
        .limit(1);

      if (error) {
        console.error("❌ Supabase query error:", error.message);
        return false;
      }

      console.log("✅ Supabase connection working");
      return true;
    } catch (err) {
      console.error("❌ Connection test failed:", err);
      return false;
    }
  }

  async checkCurrentAuthState() {
    console.log("\n👤 CHECKING CURRENT AUTH STATE...");

    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error) {
        console.error("❌ Auth state error:", error.message);
        return null;
      }

      if (user) {
        console.log("✅ User logged in:", {
          id: user.id,
          email: user.email,
          confirmed: user.email_confirmed_at ? "Yes" : "No",
          lastSignIn: user.last_sign_in_at,
        });
        return user;
      } else {
        console.log("ℹ️ No user currently logged in");
        return null;
      }
    } catch (err) {
      console.error("❌ Auth state check failed:", err);
      return null;
    }
  }

  async checkProfileExists(userId) {
    console.log("\n📋 CHECKING USER PROFILE...");

    if (!userId) {
      console.log("ℹ️ No user ID provided");
      return false;
    }

    try {
      const { data, error } = await this.supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("❌ Profile query error:", error.message);
        return false;
      }

      if (data) {
        console.log("✅ Profile exists:", data);
        return true;
      } else {
        console.log("⚠️ No profile found");
        return false;
      }
    } catch (err) {
      console.error("❌ Profile check failed:", err);
      return false;
    }
  }

  async createTestAccount() {
    console.log("\n🧪 CREATING TEST ACCOUNT...");

    const testEmail = "test@mixandmingle.app";
    const testPassword = "TestPassword123!";

    try {
      // Sign out first
      await this.supabase.auth.signOut();
      console.log("🔄 Signed out existing user");

      // Try signup
      const { data: signUpData, error: signUpError } =
        await this.supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

      if (
        signUpError &&
        !signUpError.message.includes("User already registered")
      ) {
        throw signUpError;
      }

      console.log("📝 Signup attempt completed");

      // Try signin
      const { data: signInData, error: signInError } =
        await this.supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

      if (signInError) {
        throw signInError;
      }

      console.log("✅ Test account login successful");

      // Create profile
      if (signInData.user) {
        const { error: profileError } = await this.supabase
          .from("profiles")
          .upsert({
            id: signInData.user.id,
            email: testEmail,
            language: "en",
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.warn("⚠️ Profile creation warning:", profileError.message);
        } else {
          console.log("✅ Test profile created");
        }
      }

      return signInData.user;
    } catch (err) {
      console.error("❌ Test account creation failed:", err.message);
      return null;
    }
  }

  async testLoginFlow() {
    console.log("\n🔐 TESTING LOGIN FLOW...");

    try {
      // Test logout
      await this.supabase.auth.signOut();
      console.log("✅ Logout successful");

      // Test login
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: "test@mixandmingle.app",
        password: "TestPassword123!",
      });

      if (error) {
        throw error;
      }

      console.log("✅ Login flow successful");
      return data.user;
    } catch (err) {
      console.error("❌ Login flow failed:", err.message);
      return null;
    }
  }

  async runComprehensiveCheck() {
    console.log("🚀 RUNNING COMPREHENSIVE AUTH CHECK...\n");

    const results = {
      environment: await this.checkEnvironmentVariables(),
      connection: await this.checkSupabaseConnection(),
      authState: await this.checkCurrentAuthState(),
      profile: false,
      testAccount: null,
      loginFlow: null,
    };

    if (results.authState) {
      results.profile = await this.checkProfileExists(results.authState.id);
    }

    if (!results.authState || !results.profile) {
      console.log("\n🔧 Creating test account...");
      results.testAccount = await this.createTestAccount();

      if (results.testAccount) {
        results.loginFlow = await this.testLoginFlow();
      }
    }

    console.log("\n📊 FINAL RESULTS:");
    console.log("Environment Variables:", results.environment ? "✅" : "❌");
    console.log("Supabase Connection:", results.connection ? "✅" : "❌");
    console.log("Current Auth State:", results.authState ? "✅" : "❌");
    console.log("User Profile:", results.profile ? "✅" : "❌");
    console.log("Test Account:", results.testAccount ? "✅" : "❌");
    console.log("Login Flow:", results.loginFlow ? "✅" : "❌");

    if (
      results.environment &&
      results.connection &&
      (results.authState || results.testAccount)
    ) {
      console.log("\n🎉 AUTHENTICATION IS WORKING!");
      console.log("🔗 You can now navigate to /dashboard");

      // Auto-redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } else {
      console.log("\n⚠️ AUTHENTICATION ISSUES DETECTED");
      console.log("📖 NEXT STEPS:");

      if (!results.environment) {
        console.log("1. Check environment variables in .env.local");
      }

      if (!results.connection) {
        console.log("2. Verify Supabase project settings");
        console.log("   - Check API URL and anon key");
        console.log("   - Verify project is not paused");
      }

      if (!results.testAccount) {
        console.log("3. Check Supabase Authentication settings:");
        console.log("   - Disable email confirmations");
        console.log("   - Enable auto-confirm users");
        console.log("   - Add localhost:3000 to site URLs");
      }
    }

    return results;
  }

  // Manual fixes
  async forceCreateWorkingAccount() {
    console.log("🚨 FORCE CREATING WORKING ACCOUNT...");

    try {
      await this.supabase.auth.signOut();

      // Multiple attempts with different strategies
      const attempts = [
        // Attempt 1: Simple signup/signin
        async () => {
          const { data } = await this.supabase.auth.signUp({
            email: "beta@test.com",
            password: "BetaTest123!",
          });
          return data.user;
        },

        // Attempt 2: With metadata
        async () => {
          const { data } = await this.supabase.auth.signUp({
            email: "tester@app.com",
            password: "TesterApp123!",
            options: {
              data: { language: "en" },
            },
          });
          return data.user;
        },
      ];

      for (let i = 0; i < attempts.length; i++) {
        try {
          console.log(`Attempt ${i + 1}...`);
          const user = await attempts[i]();
          if (user) {
            console.log(`✅ Attempt ${i + 1} successful`);
            return user;
          }
        } catch (err) {
          console.log(`❌ Attempt ${i + 1} failed:`, err.message);
        }
      }

      throw new Error("All attempts failed");
    } catch (err) {
      console.error("❌ Force create failed:", err);
      return null;
    }
  }
}

// Initialize and expose globally
const authChecker = new AuthStatusChecker();

// Wait for initialization then run
setTimeout(() => {
  window.authChecker = authChecker;

  console.log("🛠️ Auth Status Checker loaded!");
  console.log("📖 Available commands:");
  console.log("  authChecker.runComprehensiveCheck() - Full diagnostic");
  console.log("  authChecker.createTestAccount() - Create test account");
  console.log("  authChecker.testLoginFlow() - Test login/logout");
  console.log(
    "  authChecker.forceCreateWorkingAccount() - Force create account",
  );
  console.log("  authChecker.checkCurrentAuthState() - Check current state");

  // Auto-run comprehensive check
  authChecker.runComprehensiveCheck();
}, 1000);
