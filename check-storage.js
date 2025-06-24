/**
 * 🔍 STORAGE BUCKET CHECK
 * Direct verification of storage system
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs'
);

async function checkStorage() {
  console.log('🔍 CHECKING STORAGE SYSTEM');
  console.log('=' .repeat(30));
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.log('❌ Storage error:', error.message);
      return;
    }
    
    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`   • ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    const communityBucket = buckets.find(b => b.name === 'community-images');
    
    if (communityBucket) {
      console.log('\n✅ community-images bucket found!');
      console.log(`   • Public: ${communityBucket.public}`);
      console.log(`   • Created: ${communityBucket.created_at}`);
      
      // Test bucket access
      const { data: files, error: listError } = await supabase.storage
        .from('community-images')
        .list('', { limit: 1 });
        
      if (listError) {
        console.log('⚠️ Bucket access issue:', listError.message);
      } else {
        console.log('✅ Bucket is accessible');
        console.log(`   • Current files: ${files.length}`);
      }
      
    } else {
      console.log('\n❌ community-images bucket not found');
      console.log('Available buckets:', buckets.map(b => b.name).join(', '));
    }
    
  } catch (err) {
    console.error('❌ Storage check failed:', err.message);
  }
}

checkStorage();
