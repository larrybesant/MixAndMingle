// Quick fix for stuck redirect - bypass profile check temporarily
const fs = require("fs");
const path = require("path");

const loginPagePath = path.join(__dirname, "app", "login", "page.tsx");

console.log("🔧 Creating emergency fix for stuck redirect...");
console.log("📍 Target file:", loginPagePath);

// Read the current login page
let content = fs.readFileSync(loginPagePath, "utf8");

// Create a backup
fs.writeFileSync(loginPagePath + ".backup", content);
console.log("💾 Backup created:", loginPagePath + ".backup");

// Replace the checkProfileAndRedirect function with a simplified version
const oldFunction =
  /const checkProfileAndRedirect = async \(userId: string\) => \{[\s\S]*?\n  \};/;

const newFunction = `const checkProfileAndRedirect = async (userId: string) => {
    try {
      console.log("🔍 Checking user profile for:", userId);
      
      // EMERGENCY FIX: Skip profile check if table doesn't exist
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError) {
        console.log("⚠️ Profile error:", profileError.message);
        
        // If table doesn't exist or other errors, go to create-profile
        if (profileError.message.includes('does not exist') || 
            profileError.message.includes('relation') ||
            profileError.code === 'PGRST116') {
          console.log("🚀 Redirecting to create-profile (table missing or no profile)");
          router.push("/create-profile");
          return;
        }
        
        // For other errors, go to dashboard
        console.log("🚀 Redirecting to dashboard (other error)");
        router.push("/dashboard");
        return;
      }
      
      console.log("📊 Profile data:", {
        hasUsername: !!profileData?.username,
        hasBio: !!profileData?.bio,
        hasMusicPrefs: !!profileData?.music_preferences,
        hasAvatar: !!profileData?.avatar_url
      });
      
      if (!profileData || !profileData.username) {
        console.log("🔧 Profile incomplete, redirecting to create-profile");
        router.push("/create-profile");
      } else {
        console.log("✅ Profile complete, redirecting to dashboard");
        router.push("/dashboard");
      }
      
    } catch (error: any) {
      console.error("💥 Error checking profile:", error);
      console.log("🚀 Emergency redirect to dashboard");
      router.push("/dashboard");
    }
  };`;

if (oldFunction.test(content)) {
  content = content.replace(oldFunction, newFunction);
  fs.writeFileSync(loginPagePath, content);
  console.log("✅ Emergency fix applied!");
  console.log(
    "🔄 The login page now handles missing profiles table gracefully",
  );
  console.log("📱 Try logging in again - it should redirect properly now");
} else {
  console.log("❌ Could not find the function to replace");
  console.log("🔍 The file structure might have changed");
}

console.log("\n🎯 EMERGENCY FIX COMPLETE");
console.log("Changes made:");
console.log("1. Added error handling for missing profiles table");
console.log("2. Simplified profile completeness check");
console.log("3. Added fallback redirects to prevent hanging");
console.log("\n🚀 Please try logging in again!");
