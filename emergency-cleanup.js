// Emergency User Cleanup - Node.js Script
const fetch = require('node-fetch');

async function emergencyCleanup() {
  console.log('🚨 Starting Emergency User Cleanup...');
  
  const baseUrl = 'http://localhost:3006/api/admin/emergency-cleanup';
  
  try {
    // Step 1: Check current users
    console.log('📊 Checking current user count...');
    const countResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'count_users' })
    });
    
    const countResult = await countResponse.json();
    console.log('👥 Current users:', countResult);
    
    if (countResult.totalUsers === 0) {
      console.log('✅ No users found - database is already clean!');
      return;
    }
    
    // Step 2: Delete specific user first
    console.log('🎯 Targeting specific user: 48a955b2-040e-4add-9342-625e1ffdca43');
    const deleteResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete_specific_user',
        userId: '48a955b2-040e-4add-9342-625e1ffdca43',
        confirm: 'YES_DELETE_SPECIFIC'
      })
    });
    
    const deleteResult = await deleteResponse.json();
    console.log('🗑️ Specific deletion result:', deleteResult);
    
    // Step 3: If that fails, use nuclear option
    if (!deleteResult.success) {
      console.log('💥 Specific deletion failed, using nuclear option...');
      const nuclearResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_all_users',
          confirm: 'YES_DELETE_ALL'
        })
      });
      
      const nuclearResult = await nuclearResponse.json();
      console.log('💥 Nuclear deletion result:', nuclearResult);
    }
    
    // Step 4: Verify cleanup
    console.log('🔍 Verifying cleanup...');
    setTimeout(async () => {
      const verifyResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_cleanup' })
      });
      
      const verifyResult = await verifyResponse.json();
      console.log('🔍 Final verification:', verifyResult);
      
      if (verifyResult.verification?.totalUsers === 0) {
        console.log('🎉 SUCCESS: All users deleted! Database is clean!');
        console.log('✨ Ready for beta testing!');
      } else {
        console.log('⚠️ Some users may still remain');
        console.log('📋 Manual SQL cleanup may be required');
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    console.log('📋 Manual cleanup required in Supabase dashboard');
  }
}

emergencyCleanup();
