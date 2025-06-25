/**
 * Diagnose Photo Upload Issues
 * Run this in browser console on setup-profile page to debug photo upload
 */

async function diagnosePhotoUpload() {
  console.log("🔍 DIAGNOSING PHOTO UPLOAD ISSUES");
  console.log("================================");

  try {
    // Get Supabase client
    const { createClient } = window.supabase || {};
    if (!createClient) {
      console.error("❌ Supabase client not available");
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    console.log("✅ Supabase client created");

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("❌ User not authenticated:", userError);
      return;
    }
    console.log("✅ User authenticated:", user.email);

    // Check storage buckets
    console.log("\n📦 CHECKING STORAGE BUCKETS:");
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error("❌ Error listing buckets:", bucketsError);
    } else {
      console.log(
        "Available buckets:",
        buckets.map((b) => b.name),
      );

      const avatarsBucket = buckets.find((b) => b.name === "avatars");
      if (avatarsBucket) {
        console.log("✅ 'avatars' bucket exists");
        console.log("Bucket details:", avatarsBucket);
      } else {
        console.error("❌ 'avatars' bucket does NOT exist");
        console.log(
          "💡 You need to create the 'avatars' bucket in Supabase Storage",
        );
      }
    }

    // Test a simple file upload with a dummy file
    console.log("\n📤 TESTING FILE UPLOAD:");

    // Create a small test file
    const testContent = "test image content";
    const testFile = new File([testContent], "test.txt", {
      type: "text/plain",
    });

    const fileName = `test-${user.id}-${Date.now()}.txt`;
    const filePath = `avatars/${fileName}`;

    console.log("Attempting to upload test file:", filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, testFile);

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError);

      if (uploadError.message.includes("The resource was not found")) {
        console.log("💡 This confirms the 'avatars' bucket doesn't exist");
      } else if (uploadError.message.includes("not allowed")) {
        console.log("💡 This suggests a permissions issue");
      }
    } else {
      console.log("✅ Test upload successful:", uploadData);

      // Test getting public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      console.log("✅ Public URL generated:", urlData.publicUrl);

      // Clean up test file
      await supabase.storage.from("avatars").remove([filePath]);
      console.log("✅ Test file cleaned up");
    }
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
  }
}

// Create bucket if needed
async function createAvatarsBucket() {
  console.log("🏗️ CREATING AVATARS BUCKET");
  console.log("========================");

  try {
    const { createClient } = window.supabase || {};
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    const { data, error } = await supabase.storage.createBucket("avatars", {
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error) {
      console.error("❌ Failed to create bucket:", error);
    } else {
      console.log("✅ Avatars bucket created successfully:", data);
    }
  } catch (error) {
    console.error("❌ Error creating bucket:", error);
  }
}

// Run diagnosis
diagnosePhotoUpload();

console.log("\n🔧 AVAILABLE COMMANDS:");
console.log("• diagnosePhotoUpload() - Run full diagnosis");
console.log("• createAvatarsBucket() - Create the avatars bucket");
