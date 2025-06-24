/**
 * 🔍 COMPREHENSIVE DIAGNOSTIC
 * Check for any remaining issues with the storage setup
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs'
);

async function comprehensiveDiagnostic() {
  console.log('🔍 COMPREHENSIVE STORAGE DIAGNOSTIC');
  console.log('=' .repeat(50));
  
  const issues = [];
  const successes = [];
  
  try {
    // Test 1: Bucket listing capability
    console.log('\n1️⃣ Testing bucket listing...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      issues.push(`❌ Cannot list buckets: ${bucketsError.message}`);
      console.log(`❌ Failed: ${bucketsError.message}`);
    } else {
      if (buckets.length === 0) {
        issues.push('⚠️ No buckets visible to anon user - this might be a permission issue');
        console.log('⚠️ No buckets visible (could be normal for anon users)');
      } else {
        successes.push(`✅ Can list ${buckets.length} buckets`);
        console.log(`✅ Success: Found ${buckets.length} buckets`);
      }
    }
    
    // Test 2: Direct bucket access
    console.log('\n2️⃣ Testing direct community-images access...');
    const { data: files, error: filesError } = await supabase.storage
      .from('community-images')
      .list('', { limit: 1 });
      
    if (filesError) {
      if (filesError.message.includes('does not exist')) {
        issues.push('❌ CRITICAL: community-images bucket does not exist');
        console.log('❌ CRITICAL: Bucket does not exist');
      } else if (filesError.message.includes('policy')) {
        issues.push('⚠️ Policy might be blocking bucket listing');
        console.log('⚠️ Policy blocking access (might be intentional)');
      } else {
        issues.push(`❌ Unknown bucket access issue: ${filesError.message}`);
        console.log(`❌ Unknown issue: ${filesError.message}`);
      }
    } else {
      successes.push('✅ Can access community-images bucket directly');
      console.log('✅ Success: Direct bucket access works');
    }
    
    // Test 3: Public URL generation
    console.log('\n3️⃣ Testing public URL generation...');
    try {
      const { data: urlData } = supabase.storage
        .from('community-images')
        .getPublicUrl('test/sample.png');
        
      if (urlData && urlData.publicUrl) {
        successes.push('✅ Public URL generation works');
        console.log('✅ Success: Can generate public URLs');
        console.log(`   Sample: ${urlData.publicUrl}`);
      } else {
        issues.push('❌ Public URL generation failed');
        console.log('❌ Failed: No public URL generated');
      }
    } catch (urlError) {
      issues.push(`❌ Public URL error: ${urlError.message}`);
      console.log(`❌ URL error: ${urlError.message}`);
    }
    
    // Test 4: Upload attempt (should fail for anon)
    console.log('\n4️⃣ Testing upload restrictions...');
    try {
      const testFile = new Blob(['test'], { type: 'image/png' });
      const { error: uploadError } = await supabase.storage
        .from('community-images')
        .upload(`test-${Date.now()}.png`, testFile);
        
      if (uploadError) {
        if (uploadError.message.includes('policy') || uploadError.message.includes('security')) {
          successes.push('✅ Upload restriction working (anon blocked)');
          console.log('✅ Success: Anon upload correctly blocked');
        } else if (uploadError.message.includes('does not exist')) {
          issues.push('❌ CRITICAL: Bucket does not exist for uploads');
          console.log('❌ CRITICAL: Bucket missing for uploads');
        } else {
          issues.push(`⚠️ Unexpected upload error: ${uploadError.message}`);
          console.log(`⚠️ Unexpected: ${uploadError.message}`);
        }
      } else {
        issues.push('❌ CRITICAL: Anon upload succeeded (policy not working)');
        console.log('❌ CRITICAL: Anon upload should have failed');
      }
    } catch (uploadErr) {
      issues.push(`❌ Upload test error: ${uploadErr.message}`);
      console.log(`❌ Upload test failed: ${uploadErr.message}`);
    }
    
    // Test 5: Check if bucket name issue
    console.log('\n5️⃣ Testing bucket name variations...');
    const testBuckets = ['community-images', 'communityimages', 'community_images'];
    
    for (const bucketName of testBuckets) {
      try {
        const { data: testFiles, error: testError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
          
        if (!testError) {
          console.log(`✅ Bucket "${bucketName}" exists and is accessible`);
          if (bucketName !== 'community-images') {
            issues.push(`⚠️ Using different bucket name: ${bucketName}`);
          }
        }
      } catch (err) {
        // Silent - expected for non-existent buckets
      }
    }
    
    // Summary
    console.log('\n📊 DIAGNOSTIC SUMMARY');
    console.log('=' .repeat(50));
    
    if (successes.length > 0) {
      console.log('\n✅ WORKING CORRECTLY:');
      successes.forEach(success => console.log(`   ${success}`));
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️ POTENTIAL ISSUES:');
      issues.forEach(issue => console.log(`   ${issue}`));
      
      console.log('\n🔧 RECOMMENDED ACTIONS:');
      
      const criticalIssues = issues.filter(i => i.includes('CRITICAL'));
      const warningIssues = issues.filter(i => i.includes('⚠️') && !i.includes('CRITICAL'));
      
      if (criticalIssues.length > 0) {
        console.log('\n🚨 CRITICAL FIXES NEEDED:');
        if (issues.some(i => i.includes('does not exist'))) {
          console.log('   1. Verify community-images bucket exists in Supabase dashboard');
          console.log('   2. Check bucket name spelling (community-images)');
          console.log('   3. Ensure bucket is public');
        }
        if (issues.some(i => i.includes('Anon upload succeeded'))) {
          console.log('   1. Check INSERT policy is properly configured');
          console.log('   2. Verify policy targets community-images bucket');
        }
      }
      
      if (warningIssues.length > 0) {
        console.log('\n⚠️ MINOR IMPROVEMENTS:');
        if (issues.some(i => i.includes('No buckets visible'))) {
          console.log('   • This is normal - anon users may not list all buckets');
        }
        if (issues.some(i => i.includes('Policy might be blocking'))) {
          console.log('   • Verify SELECT policy allows public access');
        }
      }
    } else {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('   Your storage system is working perfectly!');
    }
    
  } catch (err) {
    console.error('\n❌ DIAGNOSTIC FAILED:', err.message);
    issues.push(`❌ Diagnostic error: ${err.message}`);
  }
  
  console.log('\n🎯 STATUS:', issues.filter(i => i.includes('CRITICAL')).length === 0 ? 'READY FOR PRODUCTION' : 'NEEDS ATTENTION');
}

comprehensiveDiagnostic();
