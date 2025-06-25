#!/usr/bin/env node

// Test signup functionality on both local and deployed versions
const fetch = require("node-fetch").default || require("node-fetch");

async function testSignup(baseUrl, testEmail = "testuser@example.com") {
  console.log(`\n🧪 Testing signup on: ${baseUrl}`);
  console.log(`📧 Using email: ${testEmail}`);

  try {
    const response = await fetch(`${baseUrl}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: "TestPass123!",
        metadata: {
          full_name: "Test User",
          username: "testuser123",
        },
      }),
    });

    const data = await response.json();

    console.log(`📊 Status: ${response.status}`);
    console.log(`📄 Response:`, JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("✅ Signup request successful");
    } else {
      console.log("❌ Signup request failed");
    }

    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error("🚨 Error testing signup:", error.message);
    return { success: false, error: error.message };
  }
}

async function testMultipleEndpoints() {
  console.log("🔍 Testing signup endpoints...\n");

  const testEmail = `test-${Date.now()}@example.com`;

  // Test local (if running)
  console.log("═══════════════════════════════════════");
  await testSignup("http://localhost:3000", testEmail);

  // Test deployed
  console.log("\n═══════════════════════════════════════");
  await testSignup(
    "https://mix-and-mingle-nc86irjab-larrybesants-projects.vercel.app",
    testEmail,
  );

  console.log("\n═══════════════════════════════════════");
  console.log("🏁 Testing complete");
}

// Run the test
testMultipleEndpoints().catch(console.error);
