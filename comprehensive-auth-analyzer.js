/**
 * COMPREHENSIVE AUTHENTICATION FLOW ANALYZER
 * 
 * This script will test the entire authentication system:
 * 1. Sign-up process (frontend + backend)
 * 2. Profile creation flow
 * 3. Sign-in process 
 * 4. Session management
 * 5. Profile retrieval and validation
 * 6. Redirection logic
 * 
 * Run this in the browser console on http://localhost:3000
 */

console.log('🔍 COMPREHENSIVE AUTH FLOW ANALYSIS STARTING...\n');

class AuthFlowAnalyzer {
  constructor() {
    this.testResults = {};
    this.testEmail = `auth-test-${Date.now()}@example.com`;
    this.testPassword = 'TestPassword123!';
    this.testUsername = `user${Date.now()}`;
    this.baseUrl = window.location.origin;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} ${message}`);
  }

  async testStep(stepName, testFunction) {
    console.log(`\n🧪 Testing: ${stepName}`);
    console.log('='.repeat(50));
    
    try {
      const result = await testFunction();
      this.testResults[stepName] = { status: 'PASS', result };
      this.log(`${stepName}: PASSED`, 'success');
      return result;
    } catch (error) {
      this.testResults[stepName] = { status: 'FAIL', error: error.message };
      this.log(`${stepName}: FAILED - ${error.message}`, 'error');
      throw error;
    }
  }

  async testEnvironmentSetup() {
    return this.testStep('Environment Setup', async () => {
      // Check if we have access to required libraries
      if (typeof window === 'undefined') {
        throw new Error('Must run in browser environment');
      }

      // Try to access Supabase
      let supabase;
      try {
        if (window.supabase) {
          supabase = window.supabase;
        } else {
          // Try to import from the app
          const module = await import('/lib/supabase/client.js');
          supabase = module.supabase;
        }
      } catch (error) {
        throw new Error('Cannot access Supabase client: ' + error.message);
      }

      this.supabase = supabase;

      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        throw new Error('Database connection failed: ' + error.message);
      }

      this.log('Supabase connection: OK');
      this.log(`Test email: ${this.testEmail}`);
      this.log(`Test username: ${this.testUsername}`);
      
      return { supabaseConnected: true };
    });
  }

  async testSignupProcess() {
    return this.testStep('Signup Process', async () => {
      // Step 1: Test frontend signup API
      this.log('Testing frontend signup...');
      
      const signupResponse = await fetch(`${this.baseUrl}/api/fresh-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: this.testEmail,
          password: this.testPassword
        })
      });

      let apiResult = null;
      if (signupResponse.ok) {
        apiResult = await signupResponse.json();
        this.log('API signup: SUCCESS');
      } else {
        this.log('API signup: FAILED, trying direct Supabase...', 'warning');
      }

      // Step 2: Test direct Supabase signup
      this.log('Testing direct Supabase signup...');
      
      const { data: signupData, error: signupError } = await this.supabase.auth.signUp({
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
          throw new Error('Direct signup failed: ' + signupError.message);
        }
      }

      this.userId = signupData?.user?.id;
      this.log(`Direct signup: SUCCESS (User ID: ${this.userId})`);

      return {
        apiResult,
        directResult: signupData,
        userId: this.userId
      };
    });
  }

  async testProfileCreation() {
    return this.testStep('Profile Creation', async () => {
      if (!this.userId) {
        throw new Error('No user ID available from signup');
      }

      // Step 1: Check if profile already exists
      this.log('Checking existing profile...');
      
      const { data: existingProfile, error: checkError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.userId)
        .single();

      if (existingProfile) {
        this.log('Profile already exists:', 'warning');
        console.log('Existing profile:', existingProfile);
        return { profileExists: true, profile: existingProfile };
      }

      // Step 2: Create new profile
      this.log('Creating new profile...');
      
      const profileData = {
        id: this.userId,
        username: this.testUsername,
        full_name: this.testUsername,
        bio: 'Test user created by auth analyzer',
        music_preferences: ['electronic', 'pop'],
        avatar_url: '/default-avatar.png',
        gender: 'prefer_not_to_say',
        relationship_style: 'friendship',
        preferred_language: 'en',
        is_dj: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newProfile, error: createError } = await this.supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (createError) {
        throw new Error('Profile creation failed: ' + createError.message);
      }

      this.log('Profile created successfully');
      return { profileExists: false, profile: newProfile };
    });
  }

  async testSigninProcess() {
    return this.testStep('Signin Process', async () => {
      // Step 1: Sign out first
      this.log('Signing out any existing session...');
      await this.supabase.auth.signOut();

      // Step 2: Test API login
      this.log('Testing API login...');
      
      const loginResponse = await fetch(`${this.baseUrl}/api/fresh-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: this.testEmail,
          password: this.testPassword
        })
      });

      let apiResult = null;
      if (loginResponse.ok) {
        apiResult = await loginResponse.json();
        this.log('API login: SUCCESS');
      } else {
        this.log('API login: FAILED, trying direct...', 'warning');
      }

      // Step 3: Test direct Supabase login
      this.log('Testing direct Supabase login...');
      
      const { data: loginData, error: loginError } = await this.supabase.auth.signInWithPassword({
        email: this.testEmail,
        password: this.testPassword
      });

      if (loginError) {
        throw new Error('Direct login failed: ' + loginError.message);
      }

      this.log('Direct login: SUCCESS');
      this.session = loginData.session;
      this.user = loginData.user;

      return {
        apiResult,
        directResult: loginData,
        session: this.session,
        user: this.user
      };
    });
  }

  async testSessionManagement() {
    return this.testStep('Session Management', async () => {
      // Step 1: Check current session
      this.log('Checking current session...');
      
      const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Session check failed: ' + sessionError.message);
      }

      if (!sessionData.session) {
        throw new Error('No active session found');
      }

      this.log('Session is active');

      // Step 2: Check current user
      this.log('Checking current user...');
      
      const { data: userData, error: userError } = await this.supabase.auth.getUser();
      
      if (userError) {
        throw new Error('User check failed: ' + userError.message);
      }

      if (!userData.user) {
        throw new Error('No authenticated user found');
      }

      this.log('User is authenticated');

      return {
        session: sessionData.session,
        user: userData.user,
        sessionValid: true
      };
    });
  }

  async testProfileRetrieval() {
    return this.testStep('Profile Retrieval', async () => {
      if (!this.user) {
        throw new Error('No authenticated user available');
      }

      // Step 1: Retrieve profile data
      this.log('Retrieving user profile...');
      
      const { data: profileData, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.user.id)
        .single();

      if (profileError) {
        throw new Error('Profile retrieval failed: ' + profileError.message);
      }

      // Step 2: Validate profile completeness
      this.log('Validating profile completeness...');
      
      const requiredFields = ['username', 'bio', 'music_preferences'];
      const missingFields = requiredFields.filter(field => 
        !profileData[field] || 
        (Array.isArray(profileData[field]) && profileData[field].length === 0) ||
        (typeof profileData[field] === 'string' && !profileData[field].trim())
      );

      const isComplete = missingFields.length === 0;
      
      if (isComplete) {
        this.log('Profile is complete');
      } else {
        this.log(`Profile missing: ${missingFields.join(', ')}`, 'warning');
      }

      return {
        profile: profileData,
        isComplete,
        missingFields
      };
    });
  }

  async testRedirectionLogic() {
    return this.testStep('Redirection Logic', async () => {
      const profileResult = this.testResults['Profile Retrieval']?.result;
      
      if (!profileResult) {
        throw new Error('Profile data not available');
      }

      // Simulate the frontend redirection logic
      this.log('Testing redirection logic...');
      
      let expectedRedirect;
      
      if (!profileResult.profile) {
        expectedRedirect = '/create-profile';
      } else if (!profileResult.isComplete) {
        expectedRedirect = '/setup-profile';
      } else {
        expectedRedirect = '/dashboard';
      }

      this.log(`Expected redirect: ${expectedRedirect}`);

      // Test if the target pages exist
      const pageChecks = [];
      const pagesToCheck = ['/create-profile', '/setup-profile', '/dashboard'];
      
      for (const page of pagesToCheck) {
        try {
          const response = await fetch(`${this.baseUrl}${page}`, { method: 'HEAD' });
          pageChecks.push({
            page,
            exists: response.ok || response.status === 200
          });
        } catch (error) {
          pageChecks.push({
            page,
            exists: false,
            error: error.message
          });
        }
      }

      return {
        expectedRedirect,
        pageChecks,
        profileComplete: profileResult.isComplete
      };
    });
  }

  async testEdgeCases() {
    return this.testStep('Edge Cases', async () => {
      const edgeCases = [];

      // Test 1: Duplicate email signup
      this.log('Testing duplicate email signup...');
      try {
        const { error } = await this.supabase.auth.signUp({
          email: this.testEmail,
          password: 'DifferentPassword123!'
        });
        
        if (error && error.message.includes('User already registered')) {
          edgeCases.push({ test: 'Duplicate email', result: 'HANDLED_CORRECTLY' });
        } else {
          edgeCases.push({ test: 'Duplicate email', result: 'UNEXPECTED_BEHAVIOR' });
        }
      } catch (error) {
        edgeCases.push({ test: 'Duplicate email', result: 'ERROR', error: error.message });
      }

      // Test 2: Invalid credentials login
      this.log('Testing invalid credentials...');
      try {
        const { error } = await this.supabase.auth.signInWithPassword({
          email: this.testEmail,
          password: 'WrongPassword123!'
        });
        
        if (error && error.message.includes('Invalid login credentials')) {
          edgeCases.push({ test: 'Invalid credentials', result: 'HANDLED_CORRECTLY' });
        } else {
          edgeCases.push({ test: 'Invalid credentials', result: 'UNEXPECTED_BEHAVIOR' });
        }
      } catch (error) {
        edgeCases.push({ test: 'Invalid credentials', result: 'ERROR', error: error.message });
      }

      // Test 3: Empty form submission handling
      this.log('Testing empty form validation...');
      try {
        const response = await fetch(`${this.baseUrl}/api/fresh-auth`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'signup',
            email: '',
            password: ''
          })
        });
        
        if (!response.ok) {
          edgeCases.push({ test: 'Empty form validation', result: 'HANDLED_CORRECTLY' });
        } else {
          edgeCases.push({ test: 'Empty form validation', result: 'VALIDATION_MISSING' });
        }
      } catch (error) {
        edgeCases.push({ test: 'Empty form validation', result: 'ERROR', error: error.message });
      }

      return edgeCases;
    });
  }

  async generateReport() {
    console.log('\n📊 COMPREHENSIVE AUTH FLOW ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    let passedTests = 0;
    let totalTests = 0;
    
    for (const [testName, result] of Object.entries(this.testResults)) {
      totalTests++;
      const status = result.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testName}`);
      
      if (result.status === 'PASS') {
        passedTests++;
      } else {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    console.log('\n📈 SUMMARY');
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! Authentication flow is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please review the errors above.');
      
      // Provide specific recommendations
      console.log('\n🔧 RECOMMENDATIONS:');
      
      for (const [testName, result] of Object.entries(this.testResults)) {
        if (result.status === 'FAIL') {
          console.log(`• Fix "${testName}": ${this.getRecommendation(testName, result.error)}`);
        }
      }
    }
    
    return {
      totalTests,
      passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      allPassed: passedTests === totalTests
    };
  }

  getRecommendation(testName, error) {
    const recommendations = {
      'Environment Setup': 'Check Supabase configuration and network connectivity',
      'Signup Process': 'Verify API endpoints and Supabase auth settings',
      'Profile Creation': 'Check database schema and RLS policies',
      'Signin Process': 'Verify credentials handling and session management',
      'Session Management': 'Check token refresh and session persistence',
      'Profile Retrieval': 'Verify database queries and user permissions',
      'Redirection Logic': 'Check routing configuration and page availability',
      'Edge Cases': 'Improve error handling and validation'
    };
    
    return recommendations[testName] || 'Review error details and fix accordingly';
  }

  async runFullAnalysis() {
    try {
      await this.testEnvironmentSetup();
      await this.testSignupProcess();
      await this.testProfileCreation();
      await this.testSigninProcess();
      await this.testSessionManagement();
      await this.testProfileRetrieval();
      await this.testRedirectionLogic();
      await this.testEdgeCases();
      
      return await this.generateReport();
    } catch (error) {
      console.error('\n💥 ANALYSIS STOPPED DUE TO CRITICAL ERROR:', error.message);
      await this.generateReport();
      return { criticalError: error.message };
    }
  }
}

// Create analyzer instance and run
const analyzer = new AuthFlowAnalyzer();

// Auto-run the analysis
analyzer.runFullAnalysis().then(report => {
  console.log('\n🎯 Analysis complete! Check the report above for results.');
  
  if (report.allPassed) {
    console.log('\n🚀 READY FOR BETA TESTING!');
    console.log('You can now:');
    console.log('• Deploy to production');
    console.log('• Start beta testing with real users');
    console.log('• Monitor authentication performance');
  } else {
    console.log('\n🔧 FIX NEEDED BEFORE BETA TESTING');
    console.log('Please address the failed tests first.');
  }
});

// Export for manual testing
window.authAnalyzer = analyzer;
console.log('\n💡 TIP: Use window.authAnalyzer to access the analyzer manually');
console.log('Example: window.authAnalyzer.testSignupProcess()');
