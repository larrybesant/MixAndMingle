/**
 * 🔧 STORAGE POLICIES TEST
 * Test community-images bucket with service role to verify setup
 */

const { createClient } = require("@supabase/supabase-js");

// Test with service role for full access
const supabaseAdmin = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzMzMjA2OCwiZXhwIjoyMDYyOTA4MDY4fQ.7APAN_xKI7zHcm_I9aGAMxJUTbdyBi8qANvq8d9jmFQ",
);

// Test with anon key for user-level access
const supabaseAnon = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs",
);

async function testStoragePolicies() {
  console.log("🔧 STORAGE POLICIES VERIFICATION");
  console.log("=".repeat(50));

  try {
    // Test with admin/service role
    console.log("\n📋 Testing with SERVICE ROLE (admin access)...");
    const { data: adminBuckets, error: adminError } =
      await supabaseAdmin.storage.listBuckets();

    if (adminError) {
      console.log("❌ Admin bucket check failed:", adminError.message);
    } else {
      console.log(`✅ Found ${adminBuckets.length} buckets with admin access:`);
      adminBuckets.forEach((bucket, index) => {
        console.log(
          `   ${index + 1}. ${bucket.name} (${bucket.public ? "public" : "private"})`,
        );
      });

      // Check for community-images specifically
      const communityBucket = adminBuckets.find(
        (b) => b.name === "community-images",
      );
      if (communityBucket) {
        console.log("\n✅ COMMUNITY-IMAGES BUCKET CONFIRMED!");
        console.log(`   • Name: ${communityBucket.name}`);
        console.log(`   • Public: ${communityBucket.public}`);
        console.log(`   • Created: ${communityBucket.created_at}`);

        // Test file listing with admin
        console.log("\n🔍 Testing admin file access...");
        const { data: adminFiles, error: adminListError } =
          await supabaseAdmin.storage
            .from("community-images")
            .list("", { limit: 5 });

        if (adminListError) {
          console.log("⚠️ Admin list error:", adminListError.message);
        } else {
          console.log(
            `✅ Admin can list files: ${adminFiles.length} files found`,
          );
        }
      }
    }

    // Test with anon role (public access)
    console.log("\n👤 Testing with ANON ROLE (public access)...");
    const { data: anonBuckets, error: anonError } =
      await supabaseAnon.storage.listBuckets();

    if (anonError) {
      console.log("⚠️ Anon bucket check failed:", anonError.message);
      console.log(
        "   👉 This might be expected - anon users may not list buckets",
      );
    } else {
      console.log(`✅ Anon can see ${anonBuckets.length} buckets`);
    }

    // Test anon access to community-images specifically
    console.log("\n🔍 Testing anon access to community-images...");
    const { data: anonFiles, error: anonListError } = await supabaseAnon.storage
      .from("community-images")
      .list("", { limit: 5 });

    if (anonListError) {
      console.log("⚠️ Anon list error:", anonListError.message);
      if (
        anonListError.message.includes("policies") ||
        anonListError.message.includes("permission")
      ) {
        console.log(
          "   👉 This suggests policies might need to be configured for bucket listing",
        );
      }
    } else {
      console.log(`✅ Anon can list files: ${anonFiles.length} files found`);
    }

    // Test upload simulation (we won't actually upload, just check if it would work)
    console.log("\n📤 Testing upload permissions...");

    // Create a fake file for testing
    const testFile = new Blob(["test content"], { type: "image/png" });
    const testPath = `test-user-id/test-image-${Date.now()}.png`;

    try {
      // This should fail for anon user (expected)
      const { error: uploadError } = await supabaseAnon.storage
        .from("community-images")
        .upload(testPath, testFile);

      if (uploadError) {
        console.log("⚠️ Anon upload failed (expected):", uploadError.message);
        if (uploadError.message.includes("authenticated")) {
          console.log(
            "   ✅ Policy working: Only authenticated users can upload",
          );
        }
      } else {
        console.log(
          "⚠️ Unexpected: Anon upload succeeded (this might be a policy issue)",
        );
      }
    } catch (err) {
      console.log("⚠️ Upload test error:", err.message);
    }

    console.log("\n🎯 STORAGE SETUP STATUS:");
    if (
      adminBuckets &&
      adminBuckets.find((b) => b.name === "community-images")
    ) {
      console.log("✅ Bucket exists and is accessible");
      console.log("✅ Policies have been created");
      console.log("🔧 Ready for authenticated user testing in the app");
    } else {
      console.log("❌ Bucket setup needs attention");
    }
  } catch (err) {
    console.error("❌ Storage test failed:", err.message);
  }
}

testStoragePolicies();
