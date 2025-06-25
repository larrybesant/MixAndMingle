/**
 * 🔍 DETAILED STORAGE CHECK
 * Check all buckets and test community-images access
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs",
);

async function detailedStorageCheck() {
  console.log("🔍 DETAILED STORAGE VERIFICATION");
  console.log("=".repeat(40));

  try {
    // List all buckets
    console.log("📦 Checking all storage buckets...");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.log("❌ Failed to list buckets:", bucketsError.message);
      return;
    }

    console.log(`\n📋 Found ${buckets.length} storage buckets:`);
    buckets.forEach((bucket, index) => {
      console.log(
        `   ${index + 1}. ${bucket.name} (${bucket.public ? "public" : "private"})`,
      );
    });

    // Check specifically for community-images
    const communityBucket = buckets.find((b) => b.name === "community-images");

    if (communityBucket) {
      console.log("\n✅ COMMUNITY-IMAGES BUCKET FOUND!");
      console.log(`   • Name: ${communityBucket.name}`);
      console.log(`   • Public: ${communityBucket.public}`);
      console.log(`   • Created: ${communityBucket.created_at}`);
      console.log(`   • Updated: ${communityBucket.updated_at}`);

      // Test bucket access
      console.log("\n🔍 Testing bucket access...");
      const { data: files, error: listError } = await supabase.storage
        .from("community-images")
        .list("", { limit: 5 });

      if (listError) {
        console.log("⚠️ Bucket access issue:", listError.message);
        if (listError.message.includes("policies")) {
          console.log(
            "   👉 This is expected - we need to create storage policies",
          );
        }
      } else {
        console.log("✅ Bucket is fully accessible");
        console.log(`   • Current files: ${files.length}`);
      }

      console.log("\n🎯 BUCKET STATUS: READY FOR POLICIES");
      console.log("🔧 Next step: Create storage policies for uploads");
    } else {
      console.log("\n❌ community-images bucket not found");
      console.log(
        "🔧 Available buckets:",
        buckets.map((b) => b.name).join(", "),
      );
    }
  } catch (err) {
    console.error("❌ Storage check failed:", err.message);
  }
}

detailedStorageCheck();
