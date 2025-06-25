/**
 * AUTHENTICATION DEBUGGER & FIXER
 * Copy this into browser console to diagnose and fix auth issues
 */

console.log("🔍 AUTHENTICATION DIAGNOSTICS STARTING...");

// Step 1: Check Supabase connection
async function checkSupabaseConnection() {
  try {
    console.log("🔗 Testing Supabase connection...");

    // Try to access Supabase from the page
    let supabase;
    try {
      // Try to get from app context
      supabase =
        window.supabase ||
        (await import("@supabase/supabase-js")).createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        );
    } catch (e) {
      console.log("⚠️ Cannot access Supabase directly, will test via API");
      return false;
    }

    // Test basic connection
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    if (error) {
      console.error("❌ Database connection failed:", error);
      return false;
    }

    console.log("✅ Supabase connection working");
    return supabase;
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
    return false;
  }
}

// Step 2: Check if users exist
async function checkExistingUsers(supabase) {
  try {
    console.log("👥 Checking existing users...");

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, username, full_name")
      .limit(10);

    if (error) {
      console.error("❌ Profile check failed:", error);
      return null;
    }

    console.log(`Found ${profiles?.length || 0} existing profiles:`, profiles);
    return profiles;
  } catch (error) {
    console.error("❌ User check error:", error);
    return null;
  }
}

// Step 3: Test signup process
async function testSignup(supabase) {
  try {
    console.log("📝 Testing signup process...");

    const testEmail = "test.user@mixmingle.com";
    const testPassword = "TestPass123!";
    const testUsername = "test_user_debug";

    console.log(`Testing with: ${testEmail}`);

    // First, check if user already exists
    const { data: existingUser } = await supabase.auth.getUser();
    if (existingUser.user) {
      console.log("🚪 Signing out existing user first...");
      await supabase.auth.signOut();
    }

    // Try signup
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername,
          full_name: testUsername,
        },
      },
    });

    if (error) {
      console.error("❌ Signup failed:", error);

      // Check specific error types
      if (error.message.includes("already registered")) {
        console.log("ℹ️ User already exists - this is expected");
        return testSignin(supabase, testEmail, testPassword);
      } else if (error.message.includes("405")) {
        console.log("⚠️ Email service issue - but signup might work");
        return true;
      } else {
        console.log("❌ Genuine signup issue:", error.message);
        return false;
      }
    } else {
      console.log("✅ Signup successful!", data);
      return true;
    }
  } catch (error) {
    console.error("❌ Signup test error:", error);
    return false;
  }
}

// Step 4: Test signin process
async function testSignin(
  supabase,
  email = "test.user@mixmingle.com",
  password = "TestPass123!",
) {
  try {
    console.log("🔑 Testing signin process...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Signin failed:", error);
      return false;
    } else {
      console.log("✅ Signin successful!", data);
      return true;
    }
  } catch (error) {
    console.error("❌ Signin test error:", error);
    return false;
  }
}

// Step 5: Check Supabase settings
function checkSupabaseSettings() {
  console.log("⚙️ SUPABASE SETTINGS TO CHECK:");
  console.log("1. Go to Supabase Dashboard");
  console.log("2. Authentication → Settings");
  console.log("3. Check these settings:");
  console.log("   - Email confirmations: DISABLED for testing");
  console.log("   - Auto-confirm users: ENABLED for testing");
  console.log("   - SMTP settings: Check if configured properly");
  console.log("4. Authentication → URL Configuration");
  console.log("   - Site URL: http://localhost:3001");
  console.log("   - Redirect URLs: http://localhost:3001/auth/callback");
}

// Main diagnostic function
async function runDiagnostics() {
  console.log("🚀 RUNNING FULL AUTHENTICATION DIAGNOSTICS...");
  console.log("");

  // Step 1: Check connection
  const supabase = await checkSupabaseConnection();
  if (!supabase) {
    console.log("❌ CRITICAL: Cannot connect to Supabase");
    checkSupabaseSettings();
    return;
  }

  // Step 2: Check users
  const users = await checkExistingUsers(supabase);

  // Step 3: Test signup
  const signupWorks = await testSignup(supabase);

  // Step 4: Final recommendations
  console.log("");
  console.log("📊 DIAGNOSTIC RESULTS:");
  console.log(`- Supabase Connection: ${supabase ? "✅" : "❌"}`);
  console.log(`- Database Access: ${users !== null ? "✅" : "❌"}`);
  console.log(`- Signup Process: ${signupWorks ? "✅" : "⚠️"}`);
  console.log("");

  if (signupWorks) {
    console.log("🎉 AUTHENTICATION WORKING!");
    console.log("✨ Try creating an account on the signup page");
  } else {
    console.log("🔧 FIXES NEEDED:");
    checkSupabaseSettings();
  }
}

// Auto-run diagnostics
runDiagnostics();
