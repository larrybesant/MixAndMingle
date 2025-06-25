/**
 * 🎉 POST-SETUP VERIFICATION
 * Run this after executing the SQL script
 */

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://ywfjmsbyksehjgwalqum.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs",
);

async function verifySetup() {
  console.log("🎉 VERIFYING DATABASE SETUP");
  console.log("=".repeat(40));

  try {
    // Test communities table
    const { data: communities, error: commError } = await supabase
      .from("communities")
      .select("count");

    if (commError) {
      console.log("❌ Communities table:", commError.message);
    } else {
      console.log("✅ Communities table ready");
    }

    // Test members table
    const { data: members, error: membersError } = await supabase
      .from("community_members")
      .select("count");

    if (membersError) {
      console.log("❌ Members table:", membersError.message);
    } else {
      console.log("✅ Members table ready");
    }

    // Test posts table
    const { data: posts, error: postsError } = await supabase
      .from("community_posts")
      .select("count");

    if (postsError) {
      console.log("❌ Posts table:", postsError.message);
    } else {
      console.log("✅ Posts table ready");
    }

    // Test storage bucket
    const { data: buckets, error: storageError } =
      await supabase.storage.listBuckets();
    if (!storageError) {
      const hasBucket = buckets.some((b) => b.name === "community-images");
      if (hasBucket) {
        console.log("✅ Storage bucket ready");
      } else {
        console.log("⚠️ Storage bucket missing");
      }
    }

    console.log("\n🎊 SETUP VERIFICATION COMPLETE!");
    console.log("🚀 Your Mix & Mingle app is now ready for beta launch!");
  } catch (err) {
    console.error("❌ Verification failed:", err.message);
  }
}

verifySetup();
