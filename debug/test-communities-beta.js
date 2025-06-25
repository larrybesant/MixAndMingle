// Communities Beta Testing Script
// Run this in browser console to test functionality

console.log("🚀 Communities Beta Testing Script");

async function testCommunityAPI() {
  console.log("\n📋 Testing Communities API...");

  try {
    // Test 1: Get communities
    console.log("1️⃣ Testing GET /api/communities...");
    const response = await fetch("/api/communities");
    const data = await response.json();
    console.log("✅ Communities API working:", data);

    // Test 2: Check if user is authenticated
    console.log("2️⃣ Testing user authentication...");
    const authResponse = await fetch("/api/auth/user");
    if (authResponse.ok) {
      console.log("✅ User authenticated");
    } else {
      console.log("⚠️ User not authenticated - login required");
    }

    // Test 3: Check if schema exists
    console.log("3️⃣ Testing database schema...");
    const schemaTest = await fetch("/api/communities");
    if (schemaTest.ok) {
      console.log("✅ Database schema appears to be working");
    } else {
      console.log("❌ Database schema may need setup");
    }

    console.log("\n🎯 Next steps:");
    console.log("1. Go to /admin to setup database schema if needed");
    console.log("2. Go to /communities to test the UI");
    console.log("3. Try creating a community");
    console.log("4. Try joining/leaving communities");
  } catch (error) {
    console.error("❌ API test failed:", error);
    console.log("🔧 Please check:");
    console.log("- Server is running");
    console.log("- Database is connected");
    console.log("- Environment variables are set");
  }
}

// Auto-run the test
testCommunityAPI();

// Helper functions for manual testing
window.testCommunities = {
  testAPI: testCommunityAPI,
  goToAdmin: () => (window.location.href = "/admin"),
  goToCommunities: () => (window.location.href = "/communities"),
  goToDashboard: () => (window.location.href = "/dashboard"),
};

console.log("\n🛠️ Manual testing helpers available:");
console.log("- testCommunities.testAPI() - Run API tests");
console.log("- testCommunities.goToAdmin() - Go to admin page");
console.log("- testCommunities.goToCommunities() - Go to communities page");
console.log("- testCommunities.goToDashboard() - Go to dashboard");
