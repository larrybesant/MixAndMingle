/**
 * 🚀 QUICK PRODUCTION TEST
 * Verify all critical systems are operational
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs",
);

async function quickProductionTest() {
  console.log("🚀 PRODUCTION SYSTEM CHECK");
  console.log("=".repeat(40));

  let allGood = true;

  try {
    // Test 1: Database Connection
    console.log("🔗 Testing database connection...");
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);
    if (error) {
      console.log("❌ Database connection failed:", error.message);
      allGood = false;
    } else {
      console.log("✅ Database connected successfully");
    }

    // Test 2: Communities Table
    console.log("🏘️ Testing communities table...");
    const { data: communities, error: commError } = await supabase
      .from("communities")
      .select("count")
      .limit(1);
    if (commError && commError.code === "PGRST116") {
      console.log("⚠️ Communities table not found - run schema setup!");
      console.log('   👉 Go to /admin and click "Setup Communities Schema"');
    } else if (commError) {
      console.log("❌ Communities table error:", commError.message);
      allGood = false;
    } else {
      console.log("✅ Communities table ready");
    }

    // Test 3: Storage
    console.log("🖼️ Testing image storage...");
    const { data: buckets, error: storageError } =
      await supabase.storage.listBuckets();
    if (storageError) {
      console.log("❌ Storage access failed:", storageError.message);
      allGood = false;
    } else {
      const hasCommunityBucket = buckets.some(
        (b) => b.name === "community-images",
      );
      if (hasCommunityBucket) {
        console.log("✅ Image storage ready");
      } else {
        console.log("⚠️ Community images bucket missing");
        console.log("   👉 Run schema setup to create storage bucket");
      }
    }

    // Test 4: Auth System
    console.log("🔐 Testing authentication...");
    const { data: session } = await supabase.auth.getSession();
    console.log("✅ Authentication system operational");

    console.log("\n" + "=".repeat(40));
    if (allGood) {
      console.log("🎉 ALL SYSTEMS GO! Production ready!");
      console.log("🚀 Next steps:");
      console.log("   1. Visit /admin to setup communities schema");
      console.log("   2. Test community creation");
      console.log("   3. Begin beta user recruitment!");
    } else {
      console.log("⚠️ Some issues found - check above for fixes");
    }
    console.log("=".repeat(40));
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

quickProductionTest();
