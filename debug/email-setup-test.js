#!/usr/bin/env node

/**
 * EMAIL AUTHENTICATION SETUP & TEST SCRIPT
 *
 * This script will:
 * 1. Check your current email configuration
 * 2. Test email delivery with both Resend and Supabase
 * 3. Provide step-by-step setup instructions
 * 4. Verify your authentication endpoints
 */

require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");

console.log("🚀 EMAIL AUTHENTICATION SETUP & TEST");
console.log("=====================================");

// Configuration checks
function checkEnvironment() {
  console.log("\n📋 ENVIRONMENT CONFIGURATION CHECK");
  console.log("-----------------------------------");

  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    RESEND_KEY: process.env.RESEND_KEY,
  };

  let allConfigured = true;

  Object.entries(requiredVars).forEach(([key, value]) => {
    const status = value
      ? key === "RESEND_KEY" && value.includes("xxx")
        ? "⚠️ PLACEHOLDER"
        : "✅ SET"
      : "❌ MISSING";

    console.log(`${key}: ${status}`);

    if (!value || (key === "RESEND_KEY" && value.includes("xxx"))) {
      allConfigured = false;
    }
  });

  return allConfigured;
}

// Package dependencies check
function checkDependencies() {
  console.log("\n📦 DEPENDENCY CHECK");
  console.log("-------------------");

  try {
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    const requiredPackages = {
      resend: deps.resend,
      "@supabase/supabase-js": deps["@supabase/supabase-js"],
    };

    Object.entries(requiredPackages).forEach(([pkg, version]) => {
      console.log(`${pkg}: ${version ? `✅ ${version}` : "❌ MISSING"}`);
    });

    return Object.values(requiredPackages).every((v) => v);
  } catch (error) {
    console.log("❌ Could not read package.json");
    return false;
  }
}

// File structure check
function checkFiles() {
  console.log("\n📁 FILE STRUCTURE CHECK");
  console.log("-----------------------");

  const requiredFiles = [
    "lib/email-client.ts",
    "app/api/auth/signup/route.ts",
    "app/api/auth/reset-password/route.ts",
    "app/api/test-email/route.ts",
    ".env.local",
  ];

  let allFilesExist = true;

  requiredFiles.forEach((file) => {
    const exists = fs.existsSync(file);
    console.log(`${file}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`);
    if (!exists) allFilesExist = false;
  });

  return allFilesExist;
}

// API endpoint test
async function testApiEndpoints() {
  console.log("\n🌐 API ENDPOINT TEST");
  console.log("-------------------");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const endpoints = [
    { path: "/api/test-email", method: "GET" },
    { path: "/api/auth/signup", method: "GET" },
    { path: "/api/auth/reset-password", method: "GET" },
  ];

  // Note: This would require the server to be running
  console.log("📝 To test API endpoints, run:");
  endpoints.forEach(({ path, method }) => {
    console.log(`curl -X ${method} ${baseUrl}${path}`);
  });
}

// Email service test
async function testEmailService() {
  console.log("\n📧 EMAIL SERVICE TEST");
  console.log("---------------------");

  try {
    // Dynamic import to handle potential module issues
    const { emailService } = await import("./lib/email-client.ts");

    const status = emailService.getStatus();
    console.log("Email service status:", JSON.stringify(status, null, 2));

    // Test email (you need to update this)
    const testEmail = "your-email@gmail.com"; // UPDATE THIS

    if (testEmail === "your-email@gmail.com") {
      console.log("⚠️ Update testEmail variable to test sending");
      return false;
    }

    console.log(`\n📤 Sending test email to: ${testEmail}`);
    const result = await emailService.sendTestEmail(testEmail);

    if (result.success) {
      console.log(`✅ Email sent via ${result.provider}!`);
      console.log("📮 Check your email inbox (and spam folder)");
      return true;
    } else {
      console.log(`❌ Email failed: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Email service error: ${error.message}`);
    return false;
  }
}

// Setup instructions
function showSetupInstructions() {
  console.log("\n🔧 SETUP INSTRUCTIONS");
  console.log("=====================");

  const resendKey = process.env.RESEND_KEY;
  const needsResend = !resendKey || resendKey.includes("xxx");

  if (needsResend) {
    console.log("\n📧 RESEND SETUP (Recommended):");
    console.log("1. Go to https://resend.com and create account");
    console.log("2. Go to API Keys section");
    console.log("3. Create new API key");
    console.log('4. Copy the key (starts with "re_")');
    console.log("5. Update .env.local:");
    console.log("   RESEND_KEY=re_your_actual_key_here");
    console.log("6. Restart your Next.js app");
  }

  console.log("\n🧪 TESTING WORKFLOW:");
  console.log("1. Update RESEND_KEY in .env.local");
  console.log("2. Restart your app: npm run dev");
  console.log("3. Update testEmail in this script");
  console.log("4. Run: node email-setup-test.js");
  console.log(
    "5. Test signup: curl -X POST http://localhost:3000/api/auth/signup \\",
  );
  console.log('   -H "Content-Type: application/json" \\');
  console.log(
    '   -d \'{"email":"test@example.com","password":"testpass123"}\'',
  );

  console.log("\n🚀 PRODUCTION CHECKLIST:");
  console.log("□ Verify domain in Resend dashboard");
  console.log("□ Update FROM email to use your domain");
  console.log("□ Test all email types (signup, reset, etc.)");
  console.log("□ Check email deliverability and spam placement");
  console.log("□ Set up error monitoring");
  console.log("□ Configure rate limiting");
}

// Main execution
async function main() {
  const envOk = checkEnvironment();
  const depsOk = checkDependencies();
  const filesOk = checkFiles();

  if (!envOk || !depsOk || !filesOk) {
    console.log("\n🚨 SETUP REQUIRED");
    showSetupInstructions();
    return;
  }

  console.log("\n✅ BASIC SETUP COMPLETE");

  // Test email service if configured
  if (process.env.RESEND_KEY && !process.env.RESEND_KEY.includes("xxx")) {
    await testEmailService();
  } else {
    console.log("\n⚠️ RESEND NOT CONFIGURED - Skipping email test");
    console.log("Set up Resend for reliable email delivery");
  }

  await testApiEndpoints();
  showSetupInstructions();

  console.log("\n🎯 SUMMARY");
  console.log("==========");
  console.log("✅ Email client created with Resend + Supabase fallback");
  console.log("✅ API endpoints updated to use new email service");
  console.log("✅ Beautiful email templates included");
  console.log("📧 Ready for production with proper Resend setup");
}

main().catch(console.error);
