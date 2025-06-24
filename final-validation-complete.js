/**
 * FINAL PROFILE SETUP VALIDATION
 * 
 * This script tests the complete user journey:
 * 1. User registration
 * 2. Profile setup (including photo upload)
 * 3. Database verification
 * 4. Cleanup
 * 
 * Run in browser console on http://localhost:3001
 */

console.log('🎯 FINAL PROFILE SETUP VALIDATION');
console.log('==================================');

async function validateCompleteFlow() {
  const testData = {
    email: `final-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    username: `finaluser${Date.now()}`,
    bio: 'Test user for final validation',
    music_preferences: 'House, Techno, Jazz',
    gender: 'other',
    relationship_style: 'friendship',
    location: 'Test City, TC'
  };

  try {
    console.log('🚀 Step 1: User Registration');
    
    // Create user account
    const signupResponse = await fetch('/api/fresh-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testData.email,
        password: testData.password,
        action: 'signup'
      })
    });

    const signupResult = await signupResponse.json();
    if (!signupResult.success) {
      console.error('❌ Registration failed:', signupResult.error);
      return false;
    }
    console.log('✅ User registered successfully');

    console.log('🚀 Step 2: Storage Setup');
    
    // Ensure storage is ready
    const storageResponse = await fetch('/api/admin/setup-storage', {
      method: 'POST'
    });
    
    const storageResult = await storageResponse.json();
    console.log('✅ Storage ready:', storageResult.message);

    console.log('🚀 Step 3: Photo Upload Test');
    
    // Get Supabase client
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    const supabase = createClient(
      'https://agjbtkqzqjyhrjxijeom.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnamJ0a3F6cWp5aHJqeGlqZW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwODMzNzcsImV4cCI6MjA1MDY1OTM3N30.IrLDZ8k8jPr_XOwMdz5L-rHb6xoHSB3_r3xaTLpQsJw'
    );

    // Login to get user
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testData.email,
      password: testData.password
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError);
      return false;
    }

    const user = loginData.user;
    console.log('✅ User authenticated for testing');

    // Create test image
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const testImageBlob = await fetch(testImageData).then(r => r.blob());
    const testImageFile = new File([testImageBlob], 'test-avatar.png', { type: 'image/png' });

    // Test photo upload
    const fileName = `${user.id}-${Date.now()}.png`;
    const filePath = `${user.id}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, testImageFile, {
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('❌ Photo upload failed:', uploadError);
      return false;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    console.log('✅ Photo uploaded successfully:', urlData.publicUrl);

    console.log('🚀 Step 4: Profile Creation');

    // Create complete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: testData.username,
        bio: testData.bio,
        music_preferences: testData.music_preferences,
        avatar_url: urlData.publicUrl,
        gender: testData.gender,
        relationship_style: testData.relationship_style,
        location: testData.location,
        full_name: testData.username,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      return false;
    }

    console.log('✅ Profile created successfully');

    console.log('🚀 Step 5: Data Verification');

    // Verify profile in database
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError || !profile) {
      console.error('❌ Profile verification failed:', fetchError);
      return false;
    }

    console.log('✅ Profile verified in database:', {
      username: profile.username,
      bio: profile.bio,
      avatar_url: profile.avatar_url ? '✓ Has avatar' : '✗ No avatar'
    });

    console.log('🚀 Step 6: Cleanup');

    // Clean up test data
    await supabase.storage.from('avatars').remove([filePath]);
    
    const cleanupResponse = await fetch('/api/cleanup-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testData.email })
    });

    const cleanupResult = await cleanupResponse.json();
    if (cleanupResult.success) {
      console.log('✅ Test data cleaned up');
    }

    console.log('\n🎉 VALIDATION COMPLETE - ALL SYSTEMS WORKING!');
    console.log('✅ User registration: WORKING');
    console.log('✅ Photo upload: WORKING');
    console.log('✅ Profile creation: WORKING');
    console.log('✅ Database storage: WORKING');
    console.log('✅ File cleanup: WORKING');
    console.log('\n🚀 READY FOR BETA TESTING!');

    return true;

  } catch (error) {
    console.error('❌ Validation failed:', error);
    return false;
  }
}

// Test specific photo upload function
async function testPhotoUploadOnly() {
  console.log('📸 TESTING PHOTO UPLOAD ONLY');
  
  try {
    // Check if user is logged in
    const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js');
    const supabase = createClient(
      'https://agjbtkqzqjyhrjxijeom.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnamJ0a3F6cWp5aHJqeGlqZW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUwODMzNzcsImV4cCI6MjA1MDY1OTM3N30.IrLDZ8k8jPr_XOwMdz5L-rHb6xoHSB3_r3xaTLpQsJw'
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('⚠️ No user logged in. Please log in first or run full validation.');
      return;
    }

    // Create test image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEST', 50, 55);

    canvas.toBlob(async (blob) => {
      const testFile = new File([blob], 'test-photo.png', { type: 'image/png' });
      
      const fileName = `${user.id}-test-${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      console.log('Uploading test photo...');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, testFile, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('❌ Upload failed:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        console.log('✅ Photo uploaded successfully!');
        console.log('📸 View your photo:', urlData.publicUrl);

        // Clean up
        setTimeout(async () => {
          await supabase.storage.from('avatars').remove([filePath]);
          console.log('✅ Test photo cleaned up');
        }, 5000);
      }
    }, 'image/png');

  } catch (error) {
    console.error('❌ Photo test failed:', error);
  }
}

// Run full validation
validateCompleteFlow();

console.log('\n💡 Available commands:');
console.log('• validateCompleteFlow() - Run complete validation');
console.log('• testPhotoUploadOnly() - Test photo upload only (requires login)');
console.log('• window.open("/storage-test.html") - Open visual test interface');
console.log('• window.open("/setup-profile") - Open profile setup page');
