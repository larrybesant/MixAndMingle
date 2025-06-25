// This script simulates the exact signup flow from /app/signup/page.tsx
// to help diagnose signup issues

const { createClient } = require("@supabase/supabase-js");

// Environment variables (replace with actual values for testing)
const supabaseUrl = "https://ywfjmsbyksehjgwalqum.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs";

async function testSignupFlow() {
  console.log("🔧 Testing Supabase Signup Flow...\n");

  // Test data - using unique email to avoid conflicts
  const testData = {
    username: "testuser" + Date.now(),
    email: `test-${Date.now()}@example.com`,
    password: "TestPass123!",
  };

  console.log("📝 Test data:", testData);

  try {
    // Create Supabase client (same as in the app)
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client created");

    // Test 1: Check if we can connect to Supabase
    console.log("\n🔗 Testing Supabase connection...");
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      console.log("❌ Session test error:", sessionError.message);
    } else {
      console.log("✅ Supabase connection successful");
    }

    // Test 2: Try signup (exact same call as in app)
    console.log("\n📧 Testing signup...");
    const signupResult = await supabase.auth.signUp({
      email: testData.email,
      password: testData.password,
      options: {
        data: {
          username: testData.username,
          full_name: testData.username,
        },
        emailRedirectTo: `http://localhost:3000/auth/callback`,
      },
    });

    console.log("📊 Signup result:", {
      user: signupResult.data?.user
        ? {
            id: signupResult.data.user.id,
            email: signupResult.data.user.email,
            email_confirmed_at: signupResult.data.user.email_confirmed_at,
            created_at: signupResult.data.user.created_at,
          }
        : null,
      session: signupResult.data?.session ? "Session created" : "No session",
      error: signupResult.error
        ? {
            message: signupResult.error.message,
            status: signupResult.error.status,
            details: signupResult.error,
          }
        : null,
    });

    if (signupResult.error) {
      console.log("❌ Signup failed:", signupResult.error.message);

      // Common error analysis
      const errorMsg = signupResult.error.message.toLowerCase();
      if (errorMsg.includes("email")) {
        console.log(
          "💡 Possible issue: Email-related (delivery, format, or duplicate)",
        );
      }
      if (errorMsg.includes("rate limit")) {
        console.log("💡 Possible issue: Rate limiting");
      }
      if (errorMsg.includes("password")) {
        console.log("💡 Possible issue: Password policy");
      }
      if (errorMsg.includes("signup")) {
        console.log("💡 Possible issue: Signup disabled in Supabase settings");
      }
    } else if (signupResult.data?.user) {
      console.log("✅ Signup successful!");

      if (!signupResult.data.user.email_confirmed_at) {
        console.log("📧 Email confirmation required");
      } else {
        console.log("✅ User immediately confirmed");
      }
    } else {
      console.log("⚠️ Unclear result - no user or error returned");
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error.message);
    console.error("Full error:", error);
  }

  console.log("\n🏁 Test complete");
}

// Run the test
testSignupFlow().catch(console.error);
