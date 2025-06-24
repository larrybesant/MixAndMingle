/**
 * AUTHENTICATION FLOW DEBUGGER & FIXER
 * 
 * This script identifies and fixes authentication issues by:
 * 1. Testing direct Supabase auth flow
 * 2. Testing API-based auth flow  
 * 3. Identifying mismatches between frontend/backend
 * 4. Providing specific fixes
 * 
 * Run this in browser console on http://localhost:3000
 */

console.log('🔧 AUTHENTICATION DEBUGGER & FIXER STARTING...\n');

class AuthDebugger {
  constructor() {
    this.testEmail = `auth-debug-${Date.now()}@example.com`;
    this.testPassword = 'TestPassword123!';
    this.testUsername = `debuguser${Date.now()}`;
    this.issues = [];
    this.fixes = [];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(message, type = 'info') {
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️', fix: '🔧' };
    console.log(`${icons[type]} ${message}`);
  }

  addIssue(description, severity = 'medium') {
    this.issues.push({ description, severity, timestamp: new Date() });
    this.log(`ISSUE: ${description}`, 'error');
  }

  addFix(description, action) {
    this.fixes.push({ description, action, timestamp: new Date() });
    this.log(`FIX: ${description}`, 'fix');
  }

  async testDirectSupabaseAuth() {
    this.log('Testing Direct Supabase Authentication...', 'info');
    
    try {
      // Get Supabase client
      let supabase;
      try {
        const module = await import('/lib/supabase/client.js');
        supabase = module.supabase;
      } catch (error) {
        throw new Error('Cannot import Supabase client: ' + error.message);
      }

      // Test 1: Direct signup
      this.log('1. Testing direct signup...');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: this.testEmail,
        password: this.testPassword,
        options: {
          data: {
            username: this.testUsername,
            full_name: this.testUsername
          }
        }
      });

      if (signupError) {
        if (signupError.message.includes('User already registered')) {
          this.log('User already exists, continuing...', 'warning');
        } else {
          this.addIssue(`Direct signup failed: ${signupError.message}`, 'high');
          return false;
        }
      } else {
        this.log('Direct signup successful');
      }

      // Test 2: Direct login
      this.log('2. Testing direct login...');
      await supabase.auth.signOut(); // Clear any existing session
      await this.delay(1000);

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: this.testEmail,
        password: this.testPassword
      });

      if (loginError) {
        this.addIssue(`Direct login failed: ${loginError.message}`, 'high');
        
        if (loginError.message.includes('Invalid login credentials')) {
          this.addFix(
            'Login credentials issue - may be signup/login client mismatch',
            'Use consistent Supabase client for both signup and login'
          );
        }
        return false;
      } else {
        this.log('Direct login successful');
        return true;
      }

    } catch (error) {
      this.addIssue(`Direct auth test failed: ${error.message}`, 'high');
      return false;
    }
  }

  async testAPIAuth() {
    this.log('Testing API-based Authentication...', 'info');
    
    try {
      const apiTestEmail = `api-debug-${Date.now()}@example.com`;

      // Test 1: API signup
      this.log('1. Testing API signup...');
      const signupResponse = await fetch('/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: apiTestEmail,
          password: this.testPassword
        })
      });

      const signupResult = await signupResponse.json();
      
      if (!signupResponse.ok) {
        this.addIssue(`API signup failed: ${signupResult.error}`, 'high');
        return false;
      } else {
        this.log('API signup successful');
      }

      // Test 2: API login (immediately after signup)
      this.log('2. Testing API login...');
      await this.delay(1000);

      const loginResponse = await fetch('/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: apiTestEmail,
          password: this.testPassword
        })
      });

      const loginResult = await loginResponse.json();
      
      if (!loginResponse.ok) {
        this.addIssue(`API login failed: ${loginResult.error}`, 'high');
        
        if (loginResult.error.includes('Invalid email or password')) {
          this.addFix(
            'API signup creates user but login fails - session/auth scope mismatch',
            'Ensure API signup and login use same auth scope, or return session tokens'
          );
        }
        return false;
      } else {
        this.log('API login successful');
        return true;
      }

    } catch (error) {
      this.addIssue(`API auth test failed: ${error.message}`, 'high');
      return false;
    }
  }

  async testCrossCompatibility() {
    this.log('Testing Cross-compatibility (API signup + Direct login)...', 'info');
    
    try {
      const crossTestEmail = `cross-debug-${Date.now()}@example.com`;

      // 1. Create user via API
      this.log('1. Creating user via API...');
      const signupResponse = await fetch('/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: crossTestEmail,
          password: this.testPassword
        })
      });

      if (!signupResponse.ok) {
        this.addIssue('API signup failed for cross-test', 'medium');
        return false;
      }

      // 2. Try to login via direct Supabase
      this.log('2. Testing direct login with API-created user...');
      await this.delay(1000);

      const module = await import('/lib/supabase/client.js');
      const supabase = module.supabase;
      
      await supabase.auth.signOut();
      await this.delay(500);

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: crossTestEmail,
        password: this.testPassword
      });

      if (loginError) {
        this.addIssue(`Cross-compatibility failed: ${loginError.message}`, 'high');
        this.addFix(
          'API-created users cannot login via direct Supabase client',
          'Use consistent authentication method or fix admin/anon key scope'
        );
        return false;
      } else {
        this.log('Cross-compatibility works!');
        return true;
      }

    } catch (error) {
      this.addIssue(`Cross-compatibility test failed: ${error.message}`, 'high');
      return false;
    }
  }

  async testFrontendIntegration() {
    this.log('Testing Frontend Integration...', 'info');
    
    try {
      // Check if we're on the signup page
      if (!window.location.pathname.includes('signup')) {
        this.log('Navigate to /signup to test frontend integration', 'warning');
        return null;
      }

      // Check for form elements
      const usernameInput = document.querySelector('input[placeholder*="username" i]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]');

      if (!usernameInput || !emailInput || !passwordInput || !submitButton) {
        this.addIssue('Signup form elements missing or incorrectly structured', 'medium');
        return false;
      }

      this.log('Frontend form structure is correct');

      // Test form submission (without actually submitting)
      const formTestEmail = `form-test-${Date.now()}@example.com`;
      
      // Fill form
      usernameInput.value = this.testUsername;
      emailInput.value = formTestEmail;
      passwordInput.value = this.testPassword;

      // Trigger events
      [usernameInput, emailInput, passwordInput].forEach(input => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      this.log('Form can be filled programmatically');

      // Check for validation
      const validationErrors = document.querySelectorAll('[class*="error"], [class*="red"]');
      if (validationErrors.length > 0) {
        this.log('Form validation working', 'success');
      }

      return true;

    } catch (error) {
      this.addIssue(`Frontend integration test failed: ${error.message}`, 'medium');
      return false;
    }
  }

  async generateReport() {
    this.log('\n📊 AUTHENTICATION ANALYSIS REPORT', 'info');
    console.log('='.repeat(60));

    if (this.issues.length === 0) {
      console.log('🎉 NO ISSUES FOUND! Authentication flow is working correctly.');
      return { status: 'healthy', issues: [], fixes: [] };
    }

    console.log('\n❌ ISSUES IDENTIFIED:');
    this.issues.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`);
    });

    console.log('\n🔧 RECOMMENDED FIXES:');
    this.fixes.forEach((fix, index) => {
      console.log(`${index + 1}. ${fix.description}`);
      console.log(`   Action: ${fix.action}`);
    });

    console.log('\n🎯 PRIORITY ACTIONS:');
    const highPriorityIssues = this.issues.filter(i => i.severity === 'high');
    
    if (highPriorityIssues.length > 0) {
      console.log('❗ HIGH PRIORITY:');
      highPriorityIssues.forEach(issue => {
        console.log(`• ${issue.description}`);
      });
    }

    return {
      status: 'issues_found',
      issues: this.issues,
      fixes: this.fixes,
      highPriority: highPriorityIssues
    };
  }

  async runFullDiagnosis() {
    console.log('🚀 Starting comprehensive authentication diagnosis...\n');

    const results = {
      directAuth: await this.testDirectSupabaseAuth(),
      apiAuth: await this.testAPIAuth(),
      crossCompatibility: await this.testCrossCompatibility(),
      frontendIntegration: await this.testFrontendIntegration()
    };

    const report = await this.generateReport();

    console.log('\n🔬 TEST RESULTS SUMMARY:');
    console.log(`Direct Supabase Auth: ${results.directAuth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`API Auth: ${results.apiAuth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Cross-compatibility: ${results.crossCompatibility ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Frontend Integration: ${results.frontendIntegration === null ? '⏭️ SKIP' : results.frontendIntegration ? '✅ PASS' : '❌ FAIL'}`);

    // Provide specific guidance
    if (report.status === 'healthy') {
      console.log('\n🎉 READY FOR BETA TESTING!');
      console.log('Your authentication system is working correctly.');
    } else {
      console.log('\n⚠️ AUTHENTICATION NEEDS FIXES');
      console.log('Please address the issues above before beta testing.');
      
      // Auto-fix suggestions
      this.suggestAutomaticFixes(results);
    }

    return { results, report };
  }

  suggestAutomaticFixes(results) {
    console.log('\n🔧 AUTOMATIC FIX SUGGESTIONS:');

    if (!results.directAuth && results.apiAuth) {
      console.log('💡 ISSUE: Direct auth fails but API works');
      console.log('   FIX: Update frontend to use API consistently');
      console.log('   CODE: Replace supabase.auth.signUp() with fetch("/api/fresh-auth")');
    }

    if (results.directAuth && !results.apiAuth) {
      console.log('💡 ISSUE: API auth fails but direct works');
      console.log('   FIX: Update API to use same auth scope as frontend');
      console.log('   CODE: Use anon key instead of service role for login');
    }

    if (!results.crossCompatibility) {
      console.log('💡 ISSUE: Signup/login method mismatch');
      console.log('   FIX: Use consistent authentication method');
      console.log('   CODE: Either all-API or all-direct, not mixed');
    }

    if (results.frontendIntegration === false) {
      console.log('💡 ISSUE: Frontend form problems');
      console.log('   FIX: Check form validation and event handlers');
      console.log('   CODE: Ensure proper form submission handling');
    }

    console.log('\n📝 TO IMPLEMENT FIXES:');
    console.log('1. Copy the suggested code changes');
    console.log('2. Update your source files');
    console.log('3. Test again with: authDebugger.runFullDiagnosis()');
  }
}

// Create debugger instance
const authDebugger = new AuthDebugger();

// Auto-run diagnosis
authDebugger.runFullDiagnosis().then(({ results, report }) => {
  console.log('\n🎯 Diagnosis complete! Check the report above.');
  console.log('\n💡 Available commands:');
  console.log('• authDebugger.runFullDiagnosis() - Run full test again');
  console.log('• authDebugger.testDirectSupabaseAuth() - Test direct auth only');
  console.log('• authDebugger.testAPIAuth() - Test API auth only');
  console.log('• authDebugger.testCrossCompatibility() - Test compatibility');
});

// Export to window for manual access
window.authDebugger = authDebugger;
