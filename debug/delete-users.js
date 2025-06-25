#!/usr/bin/env node

/**
 * Simple user deletion script
 * This script will delete all profiles from the profiles table
 */

const readline = require("readline");

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🧹 USER DELETION SCRIPT");
console.log("⚠️  WARNING: This will delete ALL users from your database!");
console.log("");

// Ask for confirmation
rl.question(
  'Are you sure you want to delete ALL users? Type "DELETE ALL USERS" to confirm: ',
  async (answer) => {
    if (answer === "DELETE ALL USERS") {
      console.log("");
      console.log("🚀 Starting deletion process...");

      try {
        // Call the API endpoint
        const response = await fetch("http://localhost:3001/api/clear-users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (response.ok) {
          console.log("✅ SUCCESS!");
          console.log("📊 Results:", result.details);
          console.log("");
          console.log("🎉 All users have been deleted!");
          console.log("✨ Ready to test signup with language selection");
        } else {
          console.log("❌ ERROR:", result.error);
          console.log("Details:", result.details || result.message);
        }
      } catch (error) {
        console.log("❌ FAILED to call API:", error.message);
        console.log("");
        console.log("💡 Alternative options:");
        console.log("1. Make sure the dev server is running (npm run dev)");
        console.log("2. Go to Supabase dashboard and manually delete users");
        console.log("3. Use the browser console method from CLEANUP_GUIDE.md");
      }
    } else {
      console.log("❌ Deletion cancelled. Users are safe.");
    }

    rl.close();
  },
);
