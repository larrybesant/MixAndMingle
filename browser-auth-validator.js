/**
 * BROWSER-BASED AUTHENTICATION VALIDATOR
 * 
 * This script tests the complete authentication flow in the browser
 * Copy and paste this into the browser console on your app
 */

class AuthValidator {
  constructor() {
    this.results = [];
    this.testEmail = `browser-test-${Date.now()}@example.com`;
    this.testPassword = 'TestPassword123!';
    this.testUsername = `user${Date.now()}`;
  }

  log(message, type = 'info') {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${emoji} ${message}`);
    this.results.push({ type, message });
  }

  async test(name, testFn) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log('-'.repeat(40));
    try {
      const result = await testFn();
      this.log(`${name}: PASSED`, 'success');
      return result;
    } catch (error) {
      this.log(`${name}: FAILED - ${error.message}`, 'error');
      throw error;
    }
  }

  async testApiEndpoints() {
    return this.test('API Endpoints', async () => {
      // Test signup API
      const signupResponse = await fetch('/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: this.testEmail,
          password: this.testPassword
        })
      });

      if (!signupResponse.ok) {
        const error = await signupResponse.json();
        throw new Error(`Signup API failed: ${error.error || 'Unknown error'}`);
      }

      const signupData = await signupResponse.json();
      this.log(`Signup API: Account created (${signupData.user?.id})`);

      // Wait a moment then test login
      await new Promise(resolve => setTimeout(resolve, 1000));

      const loginResponse = await fetch('/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: this.testEmail,
          password: this.testPassword
        })
      });

      if (!loginResponse.ok) {
        const error = await loginResponse.json();
        throw new Error(`Login API failed: ${error.error || 'Unknown error'}`);
      }

      const loginData = await loginResponse.json();
      this.log(`Login API: Login successful (${loginData.user?.id})`);

      return { signupData, loginData };
    });
  }

  async testSupabaseClient() {
    return this.test('Supabase Client', async () => {
      // Try to get Supabase client
      let supabase;
      try {
        if (window.supabase) {
          supabase = window.supabase;
        } else {
          const module = await import('/lib/supabase/client.js');
          supabase = module.supabase;
        }
      } catch (error) {
        throw new Error('Cannot access Supabase client');
      }

      // Test database connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      this.log('Supabase client: Connected to database');

      // Test auth methods
      const { data: session } = await supabase.auth.getSession();
      this.log(`Current session: ${session.session ? 'Active' : 'None'}`);

      return { supabase, connected: true };
    });
  }

  async testFrontendSignup() {
    return this.test('Frontend Signup Form', async () => {
      // Navigate to signup page
      if (!window.location.pathname.includes('/signup')) {
        window.location.href = '/signup';
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check if form elements exist
      const usernameInput = document.querySelector('input[placeholder*="username" i]');
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      const submitButton = document.querySelector('button[type="submit"]');

      if (!usernameInput || !emailInput || !passwordInput || !submitButton) {
        throw new Error('Signup form elements not found');
      }

      this.log('Signup form: All elements present');

      // Test form validation
      const originalEmail = this.testEmail;
      this.testEmail = `form-test-${Date.now()}@example.com`;

      // Fill form
      usernameInput.value = this.testUsername;
      emailInput.value = this.testEmail;
      passwordInput.value = this.testPassword;

      // Trigger events
      [usernameInput, emailInput, passwordInput].forEach(input => {
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });

      this.log('Signup form: Form filled successfully');

      // Submit form
      const submitPromise = new Promise(resolve => {
        const checkForResult = () => {
          const errorElement = document.querySelector('[class*="error"], [class*="red"]');
          const successElement = document.querySelector('[class*="success"], [class*="green"]');
          
          if (errorElement?.textContent?.trim()) {
            resolve({ type: 'error', message: errorElement.textContent.trim() });
          } else if (successElement?.textContent?.trim()) {
            resolve({ type: 'success', message: successElement.textContent.trim() });
          } else if (window.location.pathname !== '/signup') {
            resolve({ type: 'redirect', url: window.location.pathname });
          } else {
            setTimeout(checkForResult, 500);
          }
        };
        setTimeout(checkForResult, 100);
      });

      submitButton.click();
      const result = await Promise.race([
        submitPromise,
        new Promise(resolve => setTimeout(() => resolve({ type: 'timeout' }), 10000))
      ]);

      if (result.type === 'error') {
        throw new Error(`Form submission failed: ${result.message}`);
      } else if (result.type === 'timeout') {
        throw new Error('Form submission timed out');
      }

      this.log(`Signup form: ${result.type === 'success' ? 'Success' : 'Redirected to ' + result.url}`);
      return result;
    });
  }

  async testProfileFlow() {
    return this.test('Profile Flow', async () => {
      const { supabase } = await this.testSupabaseClient();

      // Check if we have a logged-in user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      this.log(`Profile flow: User authenticated (${userData.user.id})`);

      // Check profile existence
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw new Error(`Profile query failed: ${profileError.message}`);
      }

      if (profile) {
        this.log('Profile flow: Profile exists');
        
        // Check profile completeness
        const requiredFields = ['username', 'bio', 'music_preferences'];
        const missingFields = requiredFields.filter(field => 
          !profile[field] || 
          (Array.isArray(profile[field]) && profile[field].length === 0) ||
          (typeof profile[field] === 'string' && !profile[field].trim())
        );

        if (missingFields.length === 0) {
          this.log('Profile flow: Profile is complete');
        } else {
          this.log(`Profile flow: Profile missing ${missingFields.join(', ')}`, 'warning');
        }
      } else {
        this.log('Profile flow: No profile found', 'warning');
      }

      return { profile, user: userData.user };
    });
  }

  async testRedirectionLogic() {
    return this.test('Redirection Logic', async () => {
      const pages = ['/dashboard', '/setup-profile', '/create-profile'];
      const pageResults = [];

      for (const page of pages) {
        try {
          const response = await fetch(page, { method: 'HEAD' });
          pageResults.push({
            page,
            exists: response.ok,
            status: response.status
          });
        } catch (error) {
          pageResults.push({
            page,
            exists: false,
            error: error.message
          });
        }
      }

      const workingPages = pageResults.filter(p => p.exists);
      if (workingPages.length === 0) {
        throw new Error('No redirect target pages are accessible');
      }

      this.log(`Redirection logic: ${workingPages.length}/${pages.length} pages accessible`);
      return pageResults;
    });
  }

  async runFullValidation() {
    console.log('🚀 STARTING COMPLETE AUTHENTICATION VALIDATION');
    console.log('='.repeat(60));
    console.log(`Test credentials: ${this.testEmail} / ${this.testPassword}`);
    console.log('');

    const results = {};

    try {
      results.api = await this.testApiEndpoints();
      results.client = await this.testSupabaseClient();
      results.redirect = await this.testRedirectionLogic();
      
      // Only test frontend if we're on the right page
      if (window.location.pathname.includes('/signup')) {
        results.frontend = await this.testFrontendSignup();
        results.profile = await this.testProfileFlow();
      }

    } catch (error) {
      this.log(`Validation stopped: ${error.message}`, 'error');
    }

    this.generateReport();
    return results;
  }

  generateReport() {
    console.log('\n📊 AUTHENTICATION VALIDATION REPORT');
    console.log('='.repeat(50));

    const successes = this.results.filter(r => r.type === 'success').length;
    const errors = this.results.filter(r => r.type === 'error').length;
    const warnings = this.results.filter(r => r.type === 'warning').length;

    console.log(`✅ Successes: ${successes}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⚠️ Warnings: ${warnings}`);

    if (errors === 0) {
      console.log('\n🎉 AUTHENTICATION IS WORKING!');
      console.log('Your app is ready for beta testing.');
    } else {
      console.log('\n🔧 ISSUES FOUND');
      console.log('Please review the errors above and fix them.');
    }

    console.log('\n📋 Summary:');
    this.results.forEach(result => {
      console.log(`${result.type === 'success' ? '✅' : result.type === 'error' ? '❌' : '⚠️'} ${result.message}`);
    });

    return {
      successes,
      errors,
      warnings,
      allGood: errors === 0
    };
  }
}

// Create and run validator
const validator = new AuthValidator();

// Auto-run if on signup page, otherwise provide manual control
if (window.location.pathname.includes('/signup')) {
  console.log('📍 On signup page - running full validation...');
  validator.runFullValidation();
} else {
  console.log('📍 Not on signup page - API tests only...');
  validator.testApiEndpoints().then(() => validator.generateReport());
}

// Make available globally for manual testing
window.authValidator = validator;

console.log('\n💡 MANUAL CONTROLS:');
console.log('• authValidator.runFullValidation() - Run all tests');
console.log('• authValidator.testApiEndpoints() - Test APIs only');
console.log('• authValidator.testFrontendSignup() - Test signup form (on /signup page)');
console.log('• authValidator.generateReport() - Show current results');
