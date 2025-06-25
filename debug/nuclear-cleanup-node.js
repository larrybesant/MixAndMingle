// Nuclear User Cleanup - Node.js
const fetch = require("node-fetch");

async function nuclearCleanup() {
  console.log("💥 NUCLEAR CLEANUP: Targeting ALL 4 users in Supabase...");

  const baseUrl = "http://localhost:3006/api/admin/emergency-cleanup";

  try {
    // Force delete ALL users
    console.log("🔥 Executing nuclear option...");
    const nuclearResponse = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "delete_all_users",
        confirm: "YES_DELETE_ALL",
      }),
    });

    const nuclearResult = await nuclearResponse.json();
    console.log("💥 Nuclear deletion result:", nuclearResult);

    // Wait for deletion to propagate
    console.log("⏳ Waiting for deletion to propagate...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Verify cleanup multiple times
    for (let i = 1; i <= 3; i++) {
      console.log(`🔍 Verification attempt ${i}/3...`);

      const verifyResponse = await fetch(baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_cleanup" }),
      });

      const verifyResult = await verifyResponse.json();
      console.log(`📊 Verification ${i}:`, verifyResult);

      const totalUsers = verifyResult.verification?.totalUsers || 0;

      if (totalUsers === 0) {
        console.log("🎉 SUCCESS: All users finally deleted!");
        console.log("✨ Database is completely clean");
        console.log("🚀 Ready for fresh account creation");
        return;
      } else {
        console.log(`⚠️ ${totalUsers} users still remain, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    console.log("❌ Nuclear cleanup failed after 3 attempts");
    console.log("📋 Manual SQL cleanup required in Supabase dashboard");
    console.log("🗃️ Run the nuclear-cleanup.sql script manually");
  } catch (error) {
    console.error("💥 Nuclear cleanup error:", error.message);
    console.log("📋 Manual intervention required");
  }
}

nuclearCleanup();
