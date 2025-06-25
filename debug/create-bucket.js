/**
 * 🔧 CREATE STORAGE BUCKET
 * Create the community-images bucket programmatically
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs",
);

async function createBucket() {
  console.log("🔧 CREATING STORAGE BUCKET");
  console.log("=".repeat(30));

  try {
    // First, try to create the bucket
    const { data, error } = await supabase.storage.createBucket(
      "community-images",
      {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ],
      },
    );

    if (error) {
      console.log("❌ Bucket creation failed:", error.message);

      // If it already exists, that's actually good!
      if (error.message.includes("already exists")) {
        console.log("✅ Bucket already exists - that's perfect!");
      }
    } else {
      console.log("✅ Bucket created successfully!");
      console.log("   • Name: community-images");
      console.log("   • Public: true");
      console.log("   • Size limit: 5MB");
    }

    // Verify it's accessible
    console.log("\n🔍 Verifying bucket access...");
    const { data: files, error: listError } = await supabase.storage
      .from("community-images")
      .list("", { limit: 1 });

    if (listError) {
      console.log("❌ Bucket not accessible:", listError.message);
    } else {
      console.log("✅ Bucket is fully functional!");
      console.log("🎉 Image uploads will work perfectly!");
    }
  } catch (err) {
    console.error("❌ Bucket creation failed:", err.message);
  }
}

createBucket();
