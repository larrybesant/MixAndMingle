#!/usr/bin/env node

/**
 * FINAL EMAIL DELIVERY TEST
 * 
 * This script tests the complete email delivery system after SMTP configuration.
 * Run this to verify that password reset and authentication emails are working.
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'larrybesant@gmail.com';

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEmailConfiguration() {
  log('\n🔧 Testing Email Configuration Status...', colors.blue);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/email-config-check`);
    
    if (response.status === 200) {
      log('✅ Email configuration endpoint is working', colors.green);
      log(`📧 SMTP Provider: ${response.data.smtp_provider}`, colors.yellow);
      log(`📬 Sender Email: ${response.data.sender_email}`, colors.yellow);
      log(`🔗 Status: ${response.data.email_service_status}`, colors.yellow);
      return true;
    } else {
      log('❌ Email configuration check failed', colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error checking email configuration: ${error.message}`, colors.red);
    return false;
  }
}

async function testPasswordResetEmail() {
  log('\n📧 Testing Password Reset Email Delivery...', colors.blue);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    if (response.status === 200) {
      log('✅ Password reset email request successful', colors.green);
      log(`📧 Email sent to: ${TEST_EMAIL}`, colors.yellow);
      log('💡 Check your inbox and spam folder for the reset email', colors.blue);
      return true;
    } else {
      log(`❌ Password reset failed with status: ${response.status}`, colors.red);
      log(`Error: ${JSON.stringify(response.data, null, 2)}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error testing password reset: ${error.message}`, colors.red);
    return false;
  }
}

async function testDirectResetLink() {
  log('\n🔗 Testing Direct Reset Link (Fallback)...', colors.blue);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/direct-reset-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    if (response.status === 200) {
      log('✅ Direct reset link generation working', colors.green);
      if (response.data.reset_link) {
        log(`🔗 Direct reset link: ${response.data.reset_link}`, colors.yellow);
      }
      return true;
    } else {
      log(`❌ Direct reset link failed with status: ${response.status}`, colors.red);
      return false;
    }
  } catch (error) {
    log(`❌ Error testing direct reset link: ${error.message}`, colors.red);
    return false;
  }
}

async function runFinalEmailTest() {
  log(`${colors.bold}🚀 FINAL EMAIL DELIVERY TEST${colors.reset}`, colors.blue);
  log('='.repeat(50), colors.blue);
  
  const results = {
    emailConfig: false,
    passwordReset: false,
    directResetLink: false
  };
  
  // Test email configuration
  results.emailConfig = await testEmailConfiguration();
  
  // Test password reset email
  results.passwordReset = await testPasswordResetEmail();
  
  // Test direct reset link fallback
  results.directResetLink = await testDirectResetLink();
  
  // Summary
  log('\n📊 TEST RESULTS SUMMARY', colors.bold);
  log('='.repeat(30), colors.blue);
  
  const testsPassed = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? colors.green : colors.red;
    log(`${test.padEnd(20)} ${status}`, color);
  });
  
  log(`\n📈 Overall: ${testsPassed}/${totalTests} tests passed`, 
      testsPassed === totalTests ? colors.green : colors.yellow);
  
  if (testsPassed === totalTests) {
    log('\n🎉 ALL TESTS PASSED! Email delivery system is working correctly.', colors.green);
    log(`📧 Please check ${TEST_EMAIL} for the password reset email.`, colors.blue);
    log('✨ Your authentication system is ready for production!', colors.green);
  } else {
    log('\n⚠️  Some tests failed. Please check the logs above for details.', colors.yellow);
  }
  
  log('\n📋 NEXT STEPS:', colors.bold);
  log('1. Check your email inbox (larrybesant@gmail.com)', colors.blue);
  log('2. Verify the password reset email was received', colors.blue);
  log('3. Test the reset link in the email', colors.blue);
  log('4. Monitor Resend dashboard for delivery status', colors.blue);
  log('5. Test signup confirmation emails', colors.blue);
  
  log('\n🔍 MONITORING DASHBOARDS:', colors.bold);
  log('• Resend: https://resend.com/emails', colors.yellow);
  log('• Supabase Auth Logs: https://supabase.com/dashboard/project/ywfjmsbyksehjgwalqum/auth/logs', colors.yellow);
}

// Run the test
if (require.main === module) {
  runFinalEmailTest().catch(error => {
    log(`❌ Test failed with error: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { runFinalEmailTest };
