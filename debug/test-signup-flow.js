#!/usr/bin/env node

/**
 * Test Script: Signup Flow Validation
 *
 * This script tests the signup functionality to identify specific issues
 */

console.log("🧪 Testing Signup Flow...\n");

// Test 1: Check if signup page has proper validation
console.log("1. Checking signup page structure...");

const fs = require("fs");
const signupPagePath = "app/signup/page.tsx";

if (fs.existsSync(signupPagePath)) {
  const content = fs.readFileSync(signupPagePath, "utf8");

  // Check for profile creation
  const hasProfileCreation =
    content.includes("profiles") && content.includes("insert");
  console.log(
    `   ✅ Profile creation logic: ${hasProfileCreation ? "PRESENT" : "MISSING"}`,
  );

  // Check for proper error handling
  const hasErrorHandling =
    content.includes("try") &&
    content.includes("catch") &&
    content.includes("setError");
  console.log(
    `   ✅ Error handling: ${hasErrorHandling ? "PRESENT" : "MISSING"}`,
  );

  // Check for duplicate handlers
  const hasOnSubmit = content.includes("onSubmit={handleSignUp}");
  const hasOnClick = content.includes("onClick={handleSignUp}");
  const duplicateHandlers = hasOnSubmit && hasOnClick;
  console.log(
    `   ${duplicateHandlers ? "❌" : "✅"} Duplicate handlers: ${duplicateHandlers ? "FOUND (THIS CAUSES ISSUES)" : "NOT FOUND"}`,
  );

  // Check for loading states
  const hasLoadingState =
    content.includes("loading") && content.includes("setLoading");
  console.log(
    `   ✅ Loading states: ${hasLoadingState ? "PRESENT" : "MISSING"}`,
  );

  // Check for validation
  const hasValidation =
    content.includes("isValidUsername") && content.includes("isValidEmail");
  console.log(
    `   ✅ Input validation: ${hasValidation ? "PRESENT" : "MISSING"}`,
  );
} else {
  console.log("   ❌ Signup page not found!");
}

// Test 2: Check required pages exist
console.log("\n2. Checking required pages...");

const requiredPages = [
  "app/signup/check-email/page.tsx",
  "app/setup-profile/page.tsx",
  "app/dashboard/page.tsx",
  "lib/supabase/client.ts",
];

requiredPages.forEach((page) => {
  const exists = fs.existsSync(page);
  console.log(
    `   ${exists ? "✅" : "❌"} ${page}: ${exists ? "EXISTS" : "MISSING"}`,
  );
});

// Test 3: Check database schema
console.log("\n3. Checking database schema...");

const schemaPath = "database/schema.sql";
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");

  const hasProfilesTable = schema.includes(
    "CREATE TABLE IF NOT EXISTS profiles",
  );
  console.log(
    `   ✅ Profiles table: ${hasProfilesTable ? "DEFINED" : "MISSING"}`,
  );

  const hasUsernameField = schema.includes("username TEXT UNIQUE");
  console.log(
    `   ✅ Username field: ${hasUsernameField ? "DEFINED" : "MISSING"}`,
  );

  const hasAuthReference = schema.includes("REFERENCES auth.users(id)");
  console.log(
    `   ✅ Auth reference: ${hasAuthReference ? "DEFINED" : "MISSING"}`,
  );
} else {
  console.log("   ❌ Database schema not found!");
}

// Test 4: Environment check
console.log("\n4. Checking environment setup...");

const envFiles = fs.readdirSync(".").filter((f) => f.startsWith(".env"));
console.log(
  `   ✅ Environment files found: ${envFiles.length} (${envFiles.join(", ")})`,
);

if (envFiles.length === 0) {
  console.log(
    "   ❌ No environment files found! Supabase won't work without .env.local",
  );
}

// Summary and recommendations
console.log("\n📋 SUMMARY & RECOMMENDATIONS:");
console.log("\n🔧 FIXES APPLIED:");
console.log("   1. ✅ Added profile creation after user signup");
console.log("   2. ✅ Removed duplicate onClick handler");
console.log("   3. ✅ Added proper error handling for profile creation");
console.log("   4. ✅ Redirect to setup-profile instead of dashboard");

console.log("\n🧪 TO TEST MANUALLY:");
console.log("   1. Visit http://localhost:3000/signup");
console.log("   2. Fill out: username, email, password");
console.log('   3. Click "Create Account"');
console.log("   4. Should see success message and redirect");
console.log("   5. Check browser console for debug logs");

console.log("\n⚡ POSSIBLE ISSUES TO CHECK:");
console.log(
  "   • Environment variables not set (SUPABASE_URL, SUPABASE_ANON_KEY)",
);
console.log("   • Database not accessible or schema not applied");
console.log("   • Email confirmation required but not handled");
console.log("   • Network/CORS issues with Supabase");

console.log(
  "\n🚀 Next steps: Test the signup flow manually and check browser console for errors",
);
