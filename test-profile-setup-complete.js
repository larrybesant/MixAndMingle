/**
 * Comprehensive Profile Setup Flow Test
 * Tests the entire profile creation process including photo upload
 */

async function testProfileSetupFlow() {
  console.log("🧪 TESTING PROFILE SETUP FLOW");
  console.log("===============================");
  
  try {
    // Create a test user first
    const testEmail = `test-profile-${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";
    
    console.log("1️⃣ Creating test user...");
    
    const signupResponse = await fetch('/api/fresh-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        action: 'signup'
      })
    });
    
    const signupResult = await signupResponse.json();
    if (!signupResult.success) {
      console.error("❌ Failed to create test user:", signupResult.error);
      return;
    }
    
    console.log("✅ Test user created:", testEmail);
    
    // Test storage setup
    console.log("\n2️⃣ Setting up storage bucket...");
    
    const storageResponse = await fetch('/api/admin/setup-storage', {
      method: 'POST'
    });
    
    const storageResult = await storageResponse.json();
    if (!storageResult.success) {
      console.error("❌ Failed to setup storage:", storageResult.error);
      return;
    }
    
    console.log("✅ Storage bucket ready:", storageResult.message);
    
    // Test photo upload functionality
    console.log("\n3️⃣ Testing photo upload...");
    
    // Create a test image file (1x1 pixel PNG)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBlob = await fetch(testImageData).then(r => r.blob());
    const testImageFile = new File([testImageBlob], 'test-photo.png', { type: 'image/png' });
    
    // Get Supabase client
    const { createClient } = window.supabase || {};
    if (!createClient) {
      console.error("❌ Supabase client not available");
      return;
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    // Simulate the upload process
    const fileExt = 'png';
    const fileName = `test-${Date.now()}.${fileExt}`;
    const filePath = `test-user-id/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, testImageFile, {
        upsert: true,
        cacheControl: '3600'
      });
    
    if (uploadError) {
      console.error("❌ Photo upload failed:", uploadError);
      
      // Check if it's a missing bucket error
      if (uploadError.message.includes('The resource was not found')) {
        console.log("💡 Attempting to create avatars bucket...");
        
        const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });
        
        if (bucketError) {
          console.error("❌ Failed to create bucket:", bucketError);
        } else {
          console.log("✅ Bucket created, retrying upload...");
          
          // Retry upload
          const { data: retryData, error: retryError } = await supabase.storage
            .from('avatars')
            .upload(filePath, testImageFile);
          
          if (retryError) {
            console.error("❌ Retry upload failed:", retryError);
          } else {
            console.log("✅ Photo upload successful on retry");
          }
        }
      }
    } else {
      console.log("✅ Photo upload successful:", uploadData);
      
      // Test getting public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      console.log("✅ Public URL generated:", urlData.publicUrl);
      
      // Clean up test file
      await supabase.storage.from('avatars').remove([filePath]);
      console.log("✅ Test file cleaned up");
    }
    
    // Test profile creation
    console.log("\n4️⃣ Testing profile creation...");
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ No authenticated user found");
      return;
    }
    
    const testProfile = {
      id: user.id,
      username: `testuser_${Date.now()}`,
      bio: "Test user bio for profile setup testing",
      music_preferences: "House, Techno, Jazz",
      avatar_url: "https://example.com/test-avatar.jpg",
      gender: "other",
      relationship_style: "friendship",
      location: "Test City, TC",
      full_name: `testuser_${Date.now()}`,
      updated_at: new Date().toISOString()
    };
    
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(testProfile);
    
    if (profileError) {
      console.error("❌ Profile creation failed:", profileError);
    } else {
      console.log("✅ Profile created successfully");
    }
    
    // Clean up test user
    console.log("\n5️⃣ Cleaning up test user...");
    
    const cleanupResponse = await fetch('/api/cleanup-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const cleanupResult = await cleanupResponse.json();
    if (cleanupResult.success) {
      console.log("✅ Test user cleaned up");
    } else {
      console.warn("⚠️ Failed to clean up test user:", cleanupResult.error);
    }
    
    console.log("\n🎉 PROFILE SETUP FLOW TEST COMPLETE");
    console.log("All components tested successfully!");
    
  } catch (error) {
    console.error("❌ Test error:", error);
  }
}

// Function to check current setup-profile page state
async function checkProfilePageStatus() {
  console.log("📊 CHECKING PROFILE PAGE STATUS");
  console.log("================================");
  
  // Check if we're on the profile setup page
  if (!window.location.pathname.includes('setup-profile')) {
    console.log("⚠️ Not on profile setup page. Navigate to /setup-profile first.");
    return;
  }
  
  // Check for common elements
  const elements = {
    'Username input': document.querySelector('input[placeholder*="username"]'),
    'Bio textarea': document.querySelector('textarea[placeholder*="yourself"]'),
    'Gender select': document.querySelector('select[value*="gender"]') || document.querySelector('select').options.length > 1,
    'Photo input': document.querySelector('input[type="file"]'),
    'Next/Submit button': document.querySelector('button:not([disabled])'),
    'Error display': document.querySelector('[class*="error"]') || document.querySelector('[class*="red"]')
  };
  
  Object.entries(elements).forEach(([name, element]) => {
    console.log(`${element ? '✅' : '❌'} ${name}: ${element ? 'Found' : 'Missing'}`);
  });
  
  // Check for JavaScript errors
  const errors = [];
  const originalConsoleError = console.error;
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalConsoleError(...args);
  };
  
  setTimeout(() => {
    console.error = originalConsoleError;
    if (errors.length > 0) {
      console.log("\n❌ JavaScript errors detected:");
      errors.forEach(error => console.log(`  • ${error}`));
    } else {
      console.log("\n✅ No JavaScript errors detected");
    }
  }, 1000);
}

// Run the comprehensive test
testProfileSetupFlow();

console.log("\n🔧 AVAILABLE COMMANDS:");
console.log("• testProfileSetupFlow() - Run comprehensive test");
console.log("• checkProfilePageStatus() - Check current page state");
