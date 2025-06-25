#!/usr/bin/env node

/**
 * COMPLETE AUTHENTICATION SYSTEM TEST
 *
 * Tests all authentication features including Google OAuth setup status,
 * email delivery, password reset, and provides next steps.
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";
const TEST_EMAIL = "larrybesant@gmail.com";

// Colors for terminal output
const colors = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testEmailSystem() {
  log("\n📧 Testing Email System...", colors.blue);

  try {
    const response = await makeRequest(`${BASE_URL}/api/email-config-check`);

    if (response.status === 200) {
      log("✅ Email SMTP configured (Resend)", colors.green);
      log(`📬 Sender: ${response.data.sender_email}`, colors.cyan);
      return true;
    } else {
      log("❌ Email system check failed", colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Email test error: ${error.message}`, colors.red);
    return false;
  }
}

async function testPasswordReset() {
  log("\n🔐 Testing Password Reset...", colors.blue);

  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: TEST_EMAIL }),
    });

    if (response.status === 200) {
      log("✅ Password reset email sent successfully", colors.green);
      log(`📧 Check ${TEST_EMAIL} for reset email`, colors.cyan);
      return true;
    } else {
      log(`❌ Password reset failed: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Password reset error: ${error.message}`, colors.red);
    return false;
  }
}

async function testGoogleOAuthStatus() {
  log("\n🔑 Testing Google OAuth Status...", colors.blue);

  try {
    const response = await makeRequest(`${BASE_URL}/api/email-config-check`, {
      method: "POST",
    });

    if (response.status === 200) {
      const oauth = response.data.google_oauth;
      log("✅ Google OAuth Client ID ready", colors.green);
      log(`🆔 Client ID: ${oauth.client_id.substring(0, 20)}...`, colors.cyan);
      log(`⚠️  ${oauth.status}`, colors.yellow);
      log(`📋 Next: ${oauth.next_step}`, colors.blue);
      return response.data;
    } else {
      log("❌ OAuth status check failed", colors.red);
      return null;
    }
  } catch (error) {
    log(`❌ OAuth test error: ${error.message}`, colors.red);
    return null;
  }
}

async function testLoginPageAccess() {
  log("\n🌐 Testing Login Page Access...", colors.blue);

  try {
    const response = await makeRequest(`${BASE_URL}/login`);

    if (response.status === 200) {
      const hasGoogleButton = response.data.includes("Continue with Google");
      if (hasGoogleButton) {
        log("✅ Login page accessible with Google button", colors.green);
        return true;
      } else {
        log(
          "⚠️  Login page accessible but no Google button detected",
          colors.yellow,
        );
        return true;
      }
    } else {
      log(`❌ Login page error: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Login page test error: ${error.message}`, colors.red);
    return false;
  }
}

async function testAPIHealth() {
  log("\n⚡ Testing API Health...", colors.blue);

  const endpoints = [
    "/api/email-config-check",
    "/api/google-oauth-config",
    "/api/direct-reset-link",
  ];

  let healthyEndpoints = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`);
      if (response.status === 200) {
        log(`✅ ${endpoint}`, colors.green);
        healthyEndpoints++;
      } else {
        log(`⚠️  ${endpoint} - Status: ${response.status}`, colors.yellow);
      }
    } catch (error) {
      log(`❌ ${endpoint} - Error: ${error.message}`, colors.red);
    }
  }

  return healthyEndpoints === endpoints.length;
}

async function runCompleteAuthTest() {
  log(
    `${colors.bold}🚀 COMPLETE AUTHENTICATION SYSTEM TEST${colors.reset}`,
    colors.blue,
  );
  log("=".repeat(55), colors.blue);

  const results = {
    emailSystem: false,
    passwordReset: false,
    googleOAuth: null,
    loginPage: false,
    apiHealth: false,
  };

  // Run all tests
  results.emailSystem = await testEmailSystem();
  results.passwordReset = await testPasswordReset();
  results.googleOAuth = await testGoogleOAuthStatus();
  results.loginPage = await testLoginPageAccess();
  results.apiHealth = await testAPIHealth();

  // Summary
  log("\n📊 AUTHENTICATION SYSTEM STATUS", colors.bold);
  log("=".repeat(40), colors.blue);

  const testsPassed = Object.values(results).filter(
    (r) => r === true || (r && typeof r === "object"),
  ).length;
  const totalTests = Object.keys(results).length;

  log(
    `📧 Email System:        ${results.emailSystem ? "✅ WORKING" : "❌ FAILED"}`,
    results.emailSystem ? colors.green : colors.red,
  );
  log(
    `🔐 Password Reset:      ${results.passwordReset ? "✅ WORKING" : "❌ FAILED"}`,
    results.passwordReset ? colors.green : colors.red,
  );
  log(
    `🔑 Google OAuth:        ${results.googleOAuth ? "⚠️  NEEDS CONFIG" : "❌ FAILED"}`,
    results.googleOAuth ? colors.yellow : colors.red,
  );
  log(
    `🌐 Login Page:          ${results.loginPage ? "✅ ACCESSIBLE" : "❌ FAILED"}`,
    results.loginPage ? colors.green : colors.red,
  );
  log(
    `⚡ API Health:          ${results.apiHealth ? "✅ HEALTHY" : "❌ ISSUES"}`,
    results.apiHealth ? colors.green : colors.red,
  );

  // Next Steps
  log("\n📋 IMMEDIATE NEXT STEPS", colors.bold);
  log("=".repeat(25), colors.magenta);

  if (results.googleOAuth) {
    log("1. 🔑 Complete Google OAuth Setup:", colors.blue);
    log("   • Get Client Secret from Google Console", colors.cyan);
    log("   • Add to Supabase Dashboard", colors.cyan);
    log("   • Test Google Sign-In flow", colors.cyan);
    log("", colors.reset);
  }

  if (results.passwordReset) {
    log("2. 📧 Verify Email Delivery:", colors.blue);
    log(`   • Check ${TEST_EMAIL} inbox`, colors.cyan);
    log("   • Test password reset link", colors.cyan);
    log("   • Monitor Resend dashboard", colors.cyan);
    log("", colors.reset);
  }

  log("3. 🧪 Test User Flows:", colors.blue);
  log("   • Sign up new user", colors.cyan);
  log("   • Test email confirmation", colors.cyan);
  log("   • Test Google OAuth (after setup)", colors.cyan);
  log("   • Test profile creation", colors.cyan);
  log("", colors.reset);

  log("4. 🚀 Prepare for Production:", colors.blue);
  log("   • Update OAuth URLs for production", colors.cyan);
  log("   • Test in production environment", colors.cyan);
  log("   • Monitor authentication logs", colors.cyan);

  // Quick Links
  log("\n🔗 QUICK SETUP LINKS", colors.bold);
  log("=".repeat(20), colors.magenta);
  log(
    "• Google Console: https://console.cloud.google.com/apis/credentials",
    colors.yellow,
  );
  log(
    "• Supabase Auth: https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/providers",
    colors.yellow,
  );
  log("• Test Login: http://localhost:3000/login", colors.yellow);
  log("• Resend Dashboard: https://resend.com/emails", colors.yellow);

  // Final Status
  const overallHealth = testsPassed >= 4;
  log(
    `\n🎯 OVERALL STATUS: ${overallHealth ? "READY FOR OAUTH SETUP" : "NEEDS ATTENTION"}`,
    overallHealth ? colors.green : colors.yellow,
  );

  if (overallHealth) {
    log(
      "🎉 Your authentication system is working! Just complete Google OAuth setup.",
      colors.green,
    );
  } else {
    log(
      "⚠️  Some components need attention. Check the results above.",
      colors.yellow,
    );
  }
}

// Run the complete test
if (require.main === module) {
  runCompleteAuthTest().catch((error) => {
    log(`❌ Test suite failed: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { runCompleteAuthTest };
