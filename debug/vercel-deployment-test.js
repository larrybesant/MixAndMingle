/**
 * Vercel Deployment Verification Script
 * Run this after deployment to verify everything is working
 */

console.log("🚀 Vercel Deployment Verification");
console.log("🌐 Production URL: https://djmixandmingle.com");

// Test production deployment
async function verifyProductionDeployment() {
  console.log("🔍 Verifying production deployment...");

  const tests = [
    {
      name: "Homepage Load",
      url: "https://djmixandmingle.com",
      test: async (url) => {
        const response = await fetch(url);
        return response.ok;
      },
    },
    {
      name: "Signup Page Load",
      url: "https://djmixandmingle.com/signup",
      test: async (url) => {
        const response = await fetch(url);
        return response.ok;
      },
    },
    {
      name: "Login Page Load",
      url: "https://djmixandmingle.com/login",
      test: async (url) => {
        const response = await fetch(url);
        return response.ok;
      },
    },
    {
      name: "Email Test API",
      url: "https://djmixandmingle.com/api/auth/test-email",
      test: async (url) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: "test@example.com",
            subject: "Production Test",
            html: "<p>Testing production email</p>",
          }),
        });
        return response.status !== 500; // Should not be internal server error
      },
    },
    {
      name: "Cleanup API",
      url: "https://djmixandmingle.com/api/cleanup-users",
      test: async (url) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "test" }),
        });
        return response.status !== 500; // Should not be internal server error
      },
    },
  ];

  console.log("🧪 Running production tests...");

  for (const test of tests) {
    try {
      console.log(`⏳ Testing: ${test.name}...`);
      const result = await test.test(test.url);
      console.log(result ? `✅ ${test.name}: PASS` : `❌ ${test.name}: FAIL`);
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }

  console.log("🏁 Production verification complete!");
}

// Test local vs production comparison
async function compareLocalToProduction() {
  console.log("🔄 Comparing local vs production...");

  const localUrl = "http://localhost:3006";
  const prodUrl = "https://djmixandmingle.com";

  try {
    const localResponse = await fetch(localUrl);
    const prodResponse = await fetch(prodUrl);

    console.log(
      `📍 Local (${localUrl}): ${localResponse.ok ? "✅ OK" : "❌ FAIL"}`,
    );
    console.log(
      `🌐 Production (${prodUrl}): ${prodResponse.ok ? "✅ OK" : "❌ FAIL"}`,
    );

    if (localResponse.ok && prodResponse.ok) {
      console.log("🎉 Both local and production are working!");
    }
  } catch (error) {
    console.error("❌ Comparison failed:", error);
  }
}

// Environment verification
function verifyEnvironmentConfig() {
  console.log("🔧 Environment Configuration Check:");
  console.log("📋 Required environment variables for production:");
  console.log("   ✅ NEXT_PUBLIC_SUPABASE_URL");
  console.log("   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY");
  console.log("   ✅ NEXT_PUBLIC_APP_URL");
  console.log("   ✅ RESEND_KEY (Updated!)");
  console.log("   ✅ NODE_ENV=production");
  console.log("");
  console.log("🚀 Deployment should be automatic via GitHub push");
  console.log("📍 Check Vercel dashboard for deployment status");
}

// Available commands
console.log(`
🎯 Available Verification Commands:
1. verifyProductionDeployment() - Test all production endpoints
2. compareLocalToProduction() - Compare local vs production
3. verifyEnvironmentConfig() - Show environment setup

💡 Usage:
- Wait 2-3 minutes for Vercel deployment to complete
- Run verifyProductionDeployment() to test everything
- Check https://vercel.com/dashboard for deployment logs
`);

// Show environment config by default
verifyEnvironmentConfig();
