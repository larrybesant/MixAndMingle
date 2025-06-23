#!/usr/bin/env node

/**
 * Mix & Mingle - Comprehensive Beta Testing Script
 * 
 * This script tests all major functionality of the app to identify issues
 * before beta release.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Mix & Mingle Beta Test Suite...\n');

// Test results object
const testResults = {
  timestamp: new Date().toISOString(),
  passed: 0,
  failed: 0,
  issues: [],
  categories: {}
};

// Helper function to log test results
function logTest(category, testName, status, details = '') {
  const result = {
    category,
    test: testName,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  
  if (!testResults.categories[category]) {
    testResults.categories[category] = { passed: 0, failed: 0, tests: [] };
  }
  
  testResults.categories[category].tests.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    testResults.categories[category].passed++;
    console.log(`✅ [${category}] ${testName}`);
  } else {
    testResults.failed++;
    testResults.categories[category].failed++;
    testResults.issues.push(result);
    console.log(`❌ [${category}] ${testName}${details ? ': ' + details : ''}`);
  }
  
  if (details) {
    console.log(`   → ${details}`);
  }
}

// Test 1: File Structure & Dependencies
console.log('📁 Testing File Structure & Dependencies...');

function testFileStructure() {
  const requiredFiles = [
    'package.json',
    'next.config.mjs',
    'tailwind.config.ts',
    'app/page.tsx',
    'app/login/page.tsx',
    'app/dashboard/page.tsx',
    'lib/supabase/client.ts',
    'components/ui/input.tsx',
    'components/ui/button.tsx'
  ];
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    logTest('Structure', `File exists: ${file}`, exists ? 'PASS' : 'FAIL');
  });
}

function testDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      '@supabase/supabase-js',
      'next',
      'react',
      'react-dom',
      'tailwindcss',
      '@daily-co/daily-js',
      'twilio',
      'resend'
    ];
    
    requiredDeps.forEach(dep => {
      const exists = packageJson.dependencies[dep] || packageJson.devDependencies[dep];
      logTest('Dependencies', `Package installed: ${dep}`, exists ? 'PASS' : 'FAIL');
    });
  } catch (error) {
    logTest('Dependencies', 'package.json parsing', 'FAIL', error.message);
  }
}

// Test 2: Environment Configuration
console.log('\n🔧 Testing Environment Configuration...');

function testEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  // Check if .env.local exists
  const envExists = fs.existsSync('.env.local') || fs.existsSync('.env');
  logTest('Environment', 'Environment file exists', envExists ? 'PASS' : 'FAIL', 
    envExists ? '' : 'Missing .env.local or .env file');
  
  // Note: We can't check actual env values in this script as they're loaded by Next.js
  logTest('Environment', 'Env vars check', 'MANUAL', 
    'Manual check required: Verify SUPABASE_URL and SUPABASE_ANON_KEY are set');
}

// Test 3: Code Quality
console.log('\n🔍 Testing Code Quality...');

function testCodeQuality() {
  // Check for common anti-patterns
  const criticalFiles = [
    'app/page.tsx',
    'app/login/page.tsx',
    'app/dashboard/page.tsx'
  ];
  
  criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for TODO comments
      const todos = (content.match(/TODO|FIXME|XXX/g) || []).length;
      logTest('Code Quality', `No TODO/FIXME in ${file}`, todos === 0 ? 'PASS' : 'WARN',
        todos > 0 ? `Found ${todos} TODO/FIXME comments` : '');
      
      // Check for console.log statements
      const consoleLogs = (content.match(/console\.log/g) || []).length;
      logTest('Code Quality', `No console.log in ${file}`, consoleLogs === 0 ? 'PASS' : 'WARN',
        consoleLogs > 0 ? `Found ${consoleLogs} console.log statements` : '');
        
      // Check for proper TypeScript usage
      const hasTypeErrors = content.includes('any') && !content.includes('// @ts-ignore');
      logTest('Code Quality', `TypeScript usage in ${file}`, !hasTypeErrors ? 'PASS' : 'WARN',
        hasTypeErrors ? 'Contains "any" types without proper justification' : '');
    }
  });
}

// Test 4: UI/UX Components
console.log('\n🎨 Testing UI/UX Components...');

function testUIComponents() {
  const componentsToCheck = [
    'components/ui/button.tsx',
    'components/ui/input.tsx',
    'components/ui/card.tsx'
  ];
  
  componentsToCheck.forEach(component => {
    if (fs.existsSync(component)) {
      const content = fs.readFileSync(component, 'utf8');
      
      // Check for proper exports
      const hasDefaultExport = content.includes('export default') || content.includes('export {');
      logTest('UI Components', `Proper exports in ${component}`, hasDefaultExport ? 'PASS' : 'FAIL');
      
      // Check for TypeScript interfaces
      const hasTypes = content.includes('interface') || content.includes('type');
      logTest('UI Components', `TypeScript types in ${component}`, hasTypes ? 'PASS' : 'WARN');
    } else {
      logTest('UI Components', `Component exists: ${component}`, 'FAIL', 'File not found');
    }
  });
}

// Test 5: Authentication Flow
console.log('\n🔐 Testing Authentication Logic...');

function testAuthenticationLogic() {
  const authFiles = [
    'app/login/page.tsx',
    'lib/supabase/client.ts'
  ];
  
  authFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      // Check for proper error handling
      const hasErrorHandling = content.includes('try') && content.includes('catch');
      logTest('Authentication', `Error handling in ${file}`, hasErrorHandling ? 'PASS' : 'WARN');
      
      // Check for OAuth implementation
      if (file.includes('login')) {
        const hasOAuth = content.includes('signInWithOAuth') || content.includes('google');
        logTest('Authentication', `OAuth implementation in ${file}`, hasOAuth ? 'PASS' : 'FAIL');
      }
      
      // Check for session management
      const hasSessionMgmt = content.includes('getSession') || content.includes('getUser');
      logTest('Authentication', `Session management in ${file}`, hasSessionMgmt ? 'PASS' : 'WARN');
    }
  });
}

// Test 6: Database Integration
console.log('\n🗄️ Testing Database Integration...');

function testDatabaseIntegration() {
  // Check Supabase configuration
  if (fs.existsSync('lib/supabase/client.ts')) {
    const content = fs.readFileSync('lib/supabase/client.ts', 'utf8');
    
    const hasProperConfig = content.includes('createClient') && content.includes('supabaseUrl');
    logTest('Database', 'Supabase client configuration', hasProperConfig ? 'PASS' : 'FAIL');
    
    const hasErrorValidation = content.includes('Missing Supabase environment variables');
    logTest('Database', 'Environment validation', hasErrorValidation ? 'PASS' : 'WARN');
  }
  
  // Check for schema files
  const schemaFiles = fs.readdirSync('.').filter(f => f.includes('schema') || f.includes('supabase'));
  logTest('Database', 'Schema files present', schemaFiles.length > 0 ? 'PASS' : 'WARN',
    `Found ${schemaFiles.length} schema-related files`);
}

// Test 7: Real-time Features
console.log('\n⚡ Testing Real-time Features...');

function testRealtimeFeatures() {
  const pagesWithRealtime = ['app/page.tsx', 'app/dashboard/page.tsx'];
  
  pagesWithRealtime.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      const hasInterval = content.includes('setInterval') || content.includes('useInterval');
      logTest('Realtime', `Real-time updates in ${file}`, hasInterval ? 'PASS' : 'WARN');
      
      const hasCleanup = content.includes('clearInterval') || content.includes('return () =>');
      logTest('Realtime', `Cleanup logic in ${file}`, hasCleanup ? 'PASS' : 'WARN');
    }
  });
}

// Test 8: Mobile Responsiveness
console.log('\n📱 Testing Mobile Responsiveness...');

function testMobileResponsiveness() {
  const pageFiles = [
    'app/page.tsx',
    'app/login/page.tsx',
    'app/dashboard/page.tsx'
  ];
  
  pageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      
      const hasTailwindResponsive = content.includes('sm:') || content.includes('md:') || content.includes('lg:');
      logTest('Mobile', `Responsive design in ${file}`, hasTailwindResponsive ? 'PASS' : 'WARN');
      
      const hasFlexGrid = content.includes('flex') || content.includes('grid');
      logTest('Mobile', `Modern layout in ${file}`, hasFlexGrid ? 'PASS' : 'WARN');
    }
  });
}

// Run all tests
testFileStructure();
testDependencies();
testEnvironment();
testCodeQuality();
testUIComponents();
testAuthenticationLogic();
testDatabaseIntegration();
testRealtimeFeatures();
testMobileResponsiveness();

// Generate summary report
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`📋 Total: ${testResults.passed + testResults.failed}`);

if (testResults.issues.length > 0) {
  console.log('\n🚨 Issues Found:');
  testResults.issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.category}] ${issue.test}: ${issue.details || 'See details above'}`);
  });
}

// Category breakdown
console.log('\n📈 Category Breakdown:');
Object.entries(testResults.categories).forEach(([category, stats]) => {
  console.log(`${category}: ${stats.passed}✅ ${stats.failed}❌`);
});

// Save detailed results
const reportPath = 'beta-test-results.json';
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
console.log(`\n💾 Detailed results saved to: ${reportPath}`);

console.log('\n🎯 Next Steps:');
console.log('1. Fix any FAIL issues before beta release');
console.log('2. Address WARN issues for better UX');
console.log('3. Manually test authentication with real Supabase instance');
console.log('4. Test video/audio features with Daily.co');
console.log('5. Validate push notifications and email delivery');
console.log('6. Test deployment on Vercel with all environment variables');

const severity = testResults.failed > 0 ? 'HIGH' : (testResults.issues.filter(i => i.status === 'WARN').length > 5 ? 'MEDIUM' : 'LOW');
console.log(`\n🔔 Overall Severity: ${severity}`);

if (severity === 'HIGH') {
  console.log('❗ RECOMMENDATION: Fix critical issues before proceeding to beta');
  process.exit(1);
} else if (severity === 'MEDIUM') {
  console.log('⚠️ RECOMMENDATION: Address warnings for better user experience');
} else {
  console.log('🎉 RECOMMENDATION: Ready for beta testing with manual verification');
}
