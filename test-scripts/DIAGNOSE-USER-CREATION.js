const fs = require('fs');

// Test user account creation with comprehensive error diagnostics
async function testUserAccountCreation() {
  const baseUrl = 'http://localhost:3000';
  const testResults = [];
  
  console.log('🔍 DIAGNOSING USER ACCOUNT CREATION ISSUES...\n');
  
  // Test data
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const existingEmail = 'existing@example.com';
  
  try {
    // Test 1: Check API endpoint availability
    console.log('1️⃣ Testing API endpoint availability...');
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Signup API endpoint is available');
        console.log('   Response:', JSON.stringify(data, null, 2));
        testResults.push({ test: 'API_AVAILABILITY', status: 'PASS' });
      } else {
        console.log('❌ Signup API endpoint returned error:', response.status);
        testResults.push({ test: 'API_AVAILABILITY', status: 'FAIL', error: `HTTP ${response.status}` });
      }
    } catch (error) {
      console.log('❌ Failed to connect to signup API:', error.message);
      testResults.push({ test: 'API_AVAILABILITY', status: 'FAIL', error: error.message });
    }
    
    // Test 2: Try creating a new user account
    console.log('\n2️⃣ Testing new user account creation...');
    
    try {
      const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          metadata: {
            full_name: 'Test User',
            username: `testuser${Date.now()}`
          }
        })
      });
      
      const signupData = await signupResponse.json();
      
      if (signupResponse.ok) {
        console.log('✅ New user account created successfully');
        console.log('   User data:', JSON.stringify(signupData, null, 2));
        testResults.push({ test: 'NEW_USER_CREATION', status: 'PASS', data: signupData });
      } else {
        console.log('❌ Failed to create new user account');
        console.log('   Status:', signupResponse.status);
        console.log('   Error:', JSON.stringify(signupData, null, 2));
        testResults.push({ 
          test: 'NEW_USER_CREATION', 
          status: 'FAIL', 
          error: signupData,
          httpStatus: signupResponse.status
        });
      }
    } catch (error) {
      console.log('❌ Network error during signup:', error.message);
      testResults.push({ test: 'NEW_USER_CREATION', status: 'FAIL', error: error.message });
    }
    
    // Test 3: Try creating account with existing email
    console.log('\n3️⃣ Testing duplicate email handling...');
    
    try {
      const duplicateResponse = await fetch(`${baseUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail, // Same email as before
          password: testPassword,
          metadata: {
            full_name: 'Duplicate User',
            username: `duplicate${Date.now()}`
          }
        })
      });
      
      const duplicateData = await duplicateResponse.json();
      
      if (!duplicateResponse.ok) {
        console.log('✅ Duplicate email properly rejected');
        console.log('   Error message:', duplicateData.error);
        testResults.push({ test: 'DUPLICATE_EMAIL_HANDLING', status: 'PASS', error: duplicateData.error });
      } else {
        console.log('⚠️ Duplicate email was allowed (might be expected if confirmations are required)');
        console.log('   Response:', JSON.stringify(duplicateData, null, 2));
        testResults.push({ test: 'DUPLICATE_EMAIL_HANDLING', status: 'WARNING', data: duplicateData });
      }
    } catch (error) {
      console.log('❌ Network error during duplicate test:', error.message);
      testResults.push({ test: 'DUPLICATE_EMAIL_HANDLING', status: 'FAIL', error: error.message });
    }
    
    // Test 4: Test invalid input validation
    console.log('\n4️⃣ Testing input validation...');
    
    const invalidInputTests = [
      { name: 'missing email', data: { password: testPassword } },
      { name: 'missing password', data: { email: testEmail } },
      { name: 'invalid email format', data: { email: 'invalid-email', password: testPassword } },
      { name: 'weak password', data: { email: `weak-${Date.now()}@example.com`, password: '123' } }
    ];
    
    for (const test of invalidInputTests) {
      try {
        const response = await fetch(`${baseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(test.data)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.log(`   ✅ ${test.name}: Properly rejected - ${data.error}`);
          testResults.push({ test: `VALIDATION_${test.name.toUpperCase().replace(/\s/g, '_')}`, status: 'PASS' });
        } else {
          console.log(`   ❌ ${test.name}: Should have been rejected but was accepted`);
          testResults.push({ test: `VALIDATION_${test.name.toUpperCase().replace(/\s/g, '_')}`, status: 'FAIL' });
        }
      } catch (error) {
        console.log(`   ❌ ${test.name}: Network error - ${error.message}`);
        testResults.push({ test: `VALIDATION_${test.name.toUpperCase().replace(/\s/g, '_')}`, status: 'ERROR' });
      }
    }
    
    // Test 5: Test main auth endpoint signup action
    console.log('\n5️⃣ Testing main auth endpoint signup action...');
    
    try {
      const mainAuthResponse = await fetch(`${baseUrl}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'signup',
          email: `main-auth-${Date.now()}@example.com`,
          password: testPassword,
          metadata: {
            full_name: 'Main Auth Test User',
            username: `mainauth${Date.now()}`
          }
        })
      });
      
      const mainAuthData = await mainAuthResponse.json();
      
      if (mainAuthResponse.ok) {
        console.log('✅ Main auth endpoint signup works');
        console.log('   Response:', JSON.stringify(mainAuthData, null, 2));
        testResults.push({ test: 'MAIN_AUTH_SIGNUP', status: 'PASS', data: mainAuthData });
      } else {
        console.log('❌ Main auth endpoint signup failed');
        console.log('   Status:', mainAuthResponse.status);
        console.log('   Error:', JSON.stringify(mainAuthData, null, 2));
        testResults.push({ 
          test: 'MAIN_AUTH_SIGNUP', 
          status: 'FAIL', 
          error: mainAuthData,
          httpStatus: mainAuthResponse.status
        });
      }
    } catch (error) {
      console.log('❌ Network error during main auth test:', error.message);
      testResults.push({ test: 'MAIN_AUTH_SIGNUP', status: 'FAIL', error: error.message });
    }
    
    // Test 6: Check Supabase configuration
    console.log('\n6️⃣ Testing Supabase configuration...');
    
    try {
      const configResponse = await fetch(`${baseUrl}/api/email-config-check`, {
        method: 'GET'
      });
      
      if (configResponse.ok) {
        const configData = await configResponse.json();
        console.log('✅ Supabase configuration check available');
        console.log('   Config status:', JSON.stringify(configData, null, 2));
        testResults.push({ test: 'SUPABASE_CONFIG', status: 'PASS', config: configData });
      } else {
        console.log('❌ Supabase configuration check failed');
        testResults.push({ test: 'SUPABASE_CONFIG', status: 'FAIL' });
      }
    } catch (error) {
      console.log('❌ Error checking Supabase config:', error.message);
      testResults.push({ test: 'SUPABASE_CONFIG', status: 'ERROR', error: error.message });
    }
    
  } catch (error) {
    console.log('❌ CRITICAL ERROR during testing:', error.message);
    testResults.push({ test: 'CRITICAL_ERROR', status: 'FAIL', error: error.message });
  }
  
  // Generate summary report
  console.log('\n📊 TEST SUMMARY REPORT');
  console.log('========================');
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const errors = testResults.filter(r => r.status === 'ERROR').length;
  const warnings = testResults.filter(r => r.status === 'WARNING').length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️ Warnings: ${warnings}`);
  console.log(`🔴 Errors: ${errors}`);
  
  console.log('\n📋 DETAILED RESULTS:');
  testResults.forEach((result, index) => {
    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'ERROR': '🔴',
      'WARNING': '⚠️'
    }[result.status] || '❓';
    
    console.log(`${index + 1}. ${statusIcon} ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${typeof result.error === 'object' ? JSON.stringify(result.error, null, 4) : result.error}`);
    }
    if (result.httpStatus) {
      console.log(`   HTTP Status: ${result.httpStatus}`);
    }
  });
  
  // Write detailed report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: { passed, failed, errors, warnings },
    results: testResults
  };
  
  fs.writeFileSync('user-account-creation-diagnostic.json', JSON.stringify(reportData, null, 2));
  console.log('\n💾 Detailed report saved to: user-account-creation-diagnostic.json');
  
  // Provide recommendations
  console.log('\n🔧 RECOMMENDATIONS:');
  
  if (failed > 0 || errors > 0) {
    console.log('❗ ISSUES DETECTED - The following need immediate attention:');
    
    const failedTests = testResults.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
    failedTests.forEach(test => {
      console.log(`   • ${test.test}: ${test.error || 'Unknown error'}`);
    });
    
    console.log('\n🛠️ NEXT STEPS:');
    console.log('1. Check if the Next.js development server is running on port 3000');
    console.log('2. Verify Supabase environment variables are properly configured');
    console.log('3. Check Supabase dashboard for authentication settings');
    console.log('4. Review server logs for additional error details');
    console.log('5. Test individual API endpoints manually');
  } else {
    console.log('🎉 All core functionality appears to be working correctly!');
    console.log('   Minor warnings (if any) may be expected behavior.');
  }
}

// Run the test
testUserAccountCreation().catch(console.error);
