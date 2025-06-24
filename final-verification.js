/**
 * 🎉 FINAL PRODUCTION VERIFICATION
 * Verify Mix & Mingle is ready for launch
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs'
);

async function finalProductionVerification() {
  console.log('🎉 FINAL PRODUCTION VERIFICATION');
  console.log('=' .repeat(50));
  
  const checks = [];
  
  try {
    // 1. Database Check
    console.log('\n1️⃣ Database Verification...');
    const tables = ['profiles', 'communities', 'community_members', 'community_posts', 'events'];
    let dbWorking = true;
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          dbWorking = false;
        } else {
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`);
        dbWorking = false;
      }
    }
    checks.push({ name: 'Database', status: dbWorking });
    
    // 2. Storage Check
    console.log('\n2️⃣ Storage Verification...');
    const { data: files, error: storageError } = await supabase.storage
      .from('community-images')
      .list('', { limit: 1 });
      
    const storageWorking = !storageError;
    console.log(storageWorking ? '✅ Storage: OK' : `❌ Storage: ${storageError?.message}`);
    checks.push({ name: 'Storage', status: storageWorking });
    
    // 3. File Structure Check
    console.log('\n3️⃣ File Structure Verification...');
    const requiredFiles = [
      'app/communities/page.tsx',
      'app/events/page.tsx',
      'app/profile/page.tsx',
      'app/admin/page.tsx'
    ];
    
    let filesOK = true;
    for (const file of requiredFiles) {
      const exists = fs.existsSync(path.join(process.cwd(), file));
      console.log(exists ? `✅ ${file}` : `❌ ${file}`);
      if (!exists) filesOK = false;
    }
    checks.push({ name: 'Core Pages', status: filesOK });
    
    // 4. Debug Cleanup Check
    console.log('\n4️⃣ Cleanup Verification...');
    const rootFiles = fs.readdirSync(process.cwd());
    const debugFiles = rootFiles.filter(file => 
      file.match(/^(debug|test|diagnose|fix|setup|emergency).*\.(js|html|md)$/)
    );
    
    const cleanedUp = debugFiles.length === 0;
    console.log(cleanedUp ? '✅ Debug cleanup: Complete' : `⚠️ ${debugFiles.length} debug files remain`);
    if (!cleanedUp) {
      console.log('   Remaining:', debugFiles.slice(0, 5).join(', '));
    }
    checks.push({ name: 'Cleanup', status: cleanedUp });
    
    // 5. Security Check
    console.log('\n5️⃣ Security Verification...');
    const adminPageExists = fs.existsSync(path.join(process.cwd(), 'app/admin/page.tsx'));
    let adminSecured = false;
    
    if (adminPageExists) {
      const adminContent = fs.readFileSync(path.join(process.cwd(), 'app/admin/page.tsx'), 'utf8');
      adminSecured = adminContent.includes('ADMIN_EMAIL') && adminContent.includes('router.replace');
    }
    
    console.log(adminSecured ? '✅ Admin security: OK' : '⚠️ Admin security: Check needed');
    checks.push({ name: 'Security', status: adminSecured });
    
    // FINAL REPORT
    console.log('\n' + '='.repeat(50));
    console.log('📊 PRODUCTION READINESS SUMMARY');
    console.log('='.repeat(50));
    
    const passedChecks = checks.filter(c => c.status).length;
    const totalChecks = checks.length;
    
    checks.forEach(check => {
      console.log(`${check.status ? '✅' : '❌'} ${check.name}: ${check.status ? 'PASS' : 'FAIL'}`);
    });
    
    console.log(`\n📈 Score: ${passedChecks}/${totalChecks} (${Math.round(passedChecks/totalChecks*100)}%)`);
    
    if (passedChecks === totalChecks) {
      console.log('\n🎉 🚀 PRODUCTION READY! 🚀 🎉');
      console.log('Your Mix & Mingle app is ready for users!');
      console.log('\nNext steps:');
      console.log('1. 📧 Invite beta users');
      console.log('2. 📊 Monitor usage analytics');
      console.log('3. 🔄 Gather feedback and iterate');
      console.log('4. 🎯 Scale based on user growth');
    } else if (passedChecks >= totalChecks * 0.8) {
      console.log('\n⚠️ MOSTLY READY - Minor issues to address');
      console.log('Core functionality works, address warnings before full launch');
    } else {
      console.log('\n❌ NOT READY - Critical issues need fixing');
      console.log('Address failed checks before proceeding');
    }
    
    console.log('\n' + '='.repeat(50));
    
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  }
}

finalProductionVerification();
