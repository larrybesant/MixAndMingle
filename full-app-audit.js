/**
 * 🔍 COMPREHENSIVE APP AUDIT
 * Full application health check and broken feature detection
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://ywfjmsbyksehjgwalqum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Zmptc2J5a3NlaGpnd2FscXVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzIwNjgsImV4cCI6MjA2MjkwODA2OH0.fXx5d7iRXgpJDB_jAKgtRa2pVoAPBHU9Rly0T14HsVs'
);

async function comprehensiveAppAudit() {
  console.log('🔍 COMPREHENSIVE MIX & MINGLE APP AUDIT');
  console.log('=' .repeat(60));
  
  const issues = [];
  const warnings = [];
  const successes = [];
  const hideFromUsers = [];
  
  try {
    // 1. Database Schema Check
    console.log('\n1️⃣ DATABASE SCHEMA AUDIT');
    console.log('-'.repeat(40));
    
    const requiredTables = [
      'profiles', 
      'communities', 
      'community_members', 
      'community_posts',
      'events',
      'event_attendees'
    ];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          if (error.message.includes('does not exist')) {
            issues.push(`❌ CRITICAL: Table '${table}' does not exist`);
            console.log(`❌ Missing table: ${table}`);
          } else {
            warnings.push(`⚠️ Table '${table}' access issue: ${error.message}`);
            console.log(`⚠️ ${table}: ${error.message}`);
          }
        } else {
          successes.push(`✅ Table '${table}' exists and accessible`);
          console.log(`✅ ${table}: OK`);
        }
      } catch (err) {
        issues.push(`❌ Table '${table}' check failed: ${err.message}`);
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    // 2. Authentication System Check
    console.log('\n2️⃣ AUTHENTICATION SYSTEM AUDIT');
    console.log('-'.repeat(40));
    
    try {
      // Test sign up endpoint
      const { error: signUpError } = await supabase.auth.signUp({
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123'
      });
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          successes.push('✅ Auth signup working (email already exists)');
          console.log('✅ Auth signup: Working');
        } else {
          warnings.push(`⚠️ Auth signup issue: ${signUpError.message}`);
          console.log(`⚠️ Auth signup: ${signUpError.message}`);
        }
      } else {
        successes.push('✅ Auth signup working');
        console.log('✅ Auth signup: Working');
      }
    } catch (authErr) {
      issues.push(`❌ Auth system error: ${authErr.message}`);
      console.log(`❌ Auth error: ${authErr.message}`);
    }
    
    // 3. Storage System Check
    console.log('\n3️⃣ STORAGE SYSTEM AUDIT');
    console.log('-'.repeat(40));
    
    const requiredBuckets = ['community-images', 'avatars', 'event-images'];
    
    for (const bucket of requiredBuckets) {
      try {
        const { data: files, error: bucketError } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1 });
          
        if (bucketError) {
          if (bucketError.message.includes('does not exist')) {
            issues.push(`❌ CRITICAL: Storage bucket '${bucket}' missing`);
            console.log(`❌ Missing bucket: ${bucket}`);
          } else {
            warnings.push(`⚠️ Bucket '${bucket}' issue: ${bucketError.message}`);
            console.log(`⚠️ ${bucket}: ${bucketError.message}`);
          }
        } else {
          successes.push(`✅ Storage bucket '${bucket}' accessible`);
          console.log(`✅ ${bucket}: OK`);
        }
      } catch (storageErr) {
        issues.push(`❌ Bucket '${bucket}' check failed: ${storageErr.message}`);
        console.log(`❌ ${bucket}: ${storageErr.message}`);
      }
    }
    
    // 4. API Routes Check
    console.log('\n4️⃣ API ROUTES AUDIT');
    console.log('-'.repeat(40));
    
    const apiRoutes = [
      '/api/admin/setup-communities-schema',
      '/api/communities',
      '/api/events',
      '/api/profiles'
    ];
    
    // We'll check if these files exist in the filesystem
    for (const route of apiRoutes) {
      const filePath = path.join(process.cwd(), 'app', route.replace('/api/', ''), 'route.ts');
      const altPath = path.join(process.cwd(), 'pages', route + '.ts');
      
      if (fs.existsSync(filePath) || fs.existsSync(altPath)) {
        successes.push(`✅ API route '${route}' file exists`);
        console.log(`✅ ${route}: File exists`);
      } else {
        warnings.push(`⚠️ API route '${route}' file not found`);
        console.log(`⚠️ ${route}: File missing`);
      }
    }
    
    // 5. Check for Debug/Test Files that should be hidden
    console.log('\n5️⃣ DEBUG/TEST FILES AUDIT');
    console.log('-'.repeat(40));
    
    const debugFiles = [
      'debug-larry-login.js',
      'debug-root-cause.js',
      'diagnose-405-error.js',
      'diagnose-login.js',
      'emergency-login.html',
      'test-email-auth.js',
      'test-login.js',
      'delete-all-users.js',
      'fix-405-password-reset.js',
      'targeted-email-diagnostic.js'
    ];
    
    debugFiles.forEach(file => {
      if (fs.existsSync(path.join(process.cwd(), file))) {
        hideFromUsers.push(`🔒 HIDE: ${file} (debug/test file)`);
        console.log(`🔒 Should hide: ${file}`);
      }
    });
    
    // 6. Check for Incomplete Features
    console.log('\n6️⃣ INCOMPLETE FEATURES AUDIT');
    console.log('-'.repeat(40));
    
    // Check if pages have proper error handling
    const appPages = [
      'app/communities/page.tsx',
      'app/events/page.tsx',
      'app/profile/page.tsx',
      'app/admin/page.tsx'
    ];
    
    for (const page of appPages) {
      const fullPath = path.join(process.cwd(), page);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Check for common issues
          if (content.includes('TODO') || content.includes('FIXME')) {
            warnings.push(`⚠️ ${page} contains TODO/FIXME comments`);
            console.log(`⚠️ ${page}: Has TODOs`);
          }
          
          if (content.includes('console.log') && !content.includes('console.error')) {
            warnings.push(`⚠️ ${page} has debug console.log statements`);
            console.log(`⚠️ ${page}: Debug logs present`);
          }
          
          if (!content.includes('error') && !content.includes('Error')) {
            warnings.push(`⚠️ ${page} might lack error handling`);
            console.log(`⚠️ ${page}: No error handling detected`);
          } else {
            successes.push(`✅ ${page} appears to have error handling`);
            console.log(`✅ ${page}: Has error handling`);
          }
          
        } catch (readErr) {
          warnings.push(`⚠️ Could not read ${page}: ${readErr.message}`);
        }
      } else {
        issues.push(`❌ Missing page: ${page}`);
        console.log(`❌ Missing: ${page}`);
      }
    }
    
    // 7. Environment Variables Check
    console.log('\n7️⃣ ENVIRONMENT VARIABLES AUDIT');
    console.log('-'.repeat(40));
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      successes.push('✅ .env.local file exists');
      console.log('✅ .env.local: Exists');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
          successes.push(`✅ Environment variable ${envVar} defined`);
          console.log(`✅ ${envVar}: Defined`);
        } else {
          issues.push(`❌ Missing environment variable: ${envVar}`);
          console.log(`❌ Missing: ${envVar}`);
        }
      });
    } else {
      issues.push('❌ CRITICAL: .env.local file missing');
      console.log('❌ .env.local: Missing');
    }
    
    // FINAL AUDIT REPORT
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE AUDIT REPORT');
    console.log('='.repeat(60));
    
    console.log(`\n✅ WORKING CORRECTLY (${successes.length}):`);
    successes.forEach(success => console.log(`   ${success}`));
    
    if (warnings.length > 0) {
      console.log(`\n⚠️ WARNINGS & IMPROVEMENTS (${warnings.length}):`);
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (issues.length > 0) {
      console.log(`\n❌ CRITICAL ISSUES (${issues.length}):`);
      issues.forEach(issue => console.log(`   ${issue}`));
    }
    
    if (hideFromUsers.length > 0) {
      console.log(`\n🔒 SHOULD HIDE FROM USERS (${hideFromUsers.length}):`);
      hideFromUsers.forEach(hide => console.log(`   ${hide}`));
    }
    
    // RECOMMENDATIONS
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    
    if (issues.length > 0) {
      console.log('\n🚨 IMMEDIATE FIXES REQUIRED:');
      if (issues.some(i => i.includes('Table'))) {
        console.log('   • Run database setup script (SETUP_DATABASE_DIRECT.sql)');
      }
      if (issues.some(i => i.includes('bucket'))) {
        console.log('   • Create missing storage buckets in Supabase');
      }
      if (issues.some(i => i.includes('env'))) {
        console.log('   • Set up environment variables in .env.local');
      }
    }
    
    if (hideFromUsers.length > 0) {
      console.log('\n🔒 FILES TO HIDE/REMOVE BEFORE PRODUCTION:');
      console.log('   • Move debug files to a /debug folder');
      console.log('   • Add these to .gitignore');
      console.log('   • Remove from public access');
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ IMPROVEMENTS FOR BETTER UX:');
      console.log('   • Add proper error handling to pages');
      console.log('   • Remove debug console.log statements');
      console.log('   • Complete TODO items');
    }
    
    // OVERALL STATUS
    const criticalIssues = issues.filter(i => i.includes('CRITICAL')).length;
    const status = criticalIssues === 0 ? 'PRODUCTION READY' : 'NEEDS CRITICAL FIXES';
    
    console.log(`\n🎯 OVERALL STATUS: ${status}`);
    console.log(`   • Critical Issues: ${criticalIssues}`);
    console.log(`   • Warnings: ${warnings.length}`);
    console.log(`   • Working Features: ${successes.length}`);
    
  } catch (err) {
    console.error('\n❌ AUDIT FAILED:', err.message);
  }
}

comprehensiveAppAudit();
