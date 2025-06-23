/**
 * EMERGENCY AUTHENTICATION FIX SCRIPT
 * 
 * This script will diagnose and fix authentication issues to ensure
 * at least one working test account for beta testing.
 * 
 * Run this in browser console on localhost:3000
 */

console.log('🚨 EMERGENCY AUTH FIX STARTING...');

// Step 1: Check Supabase connection and configuration
async function checkSupabaseConnection() {
    console.log('📡 Checking Supabase connection...');
    
    try {
        // Get the Supabase client
        const supabase = window.supabase || (await import('/utils/supabase/client')).createClient();
        
        // Test basic connection
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
            console.error('❌ Supabase connection error:', error);
            return false;
        }
        
        console.log('✅ Supabase connection working');
        return true;
    } catch (err) {
        console.error('❌ Failed to connect to Supabase:', err);
        return false;
    }
}

// Step 2: Create a guaranteed test account
async function createTestAccount() {
    console.log('👤 Creating guaranteed test account...');
    
    const testEmail = 'test@mixandmingle.app';
    const testPassword = 'TestPassword123!';
    
    try {
        // First, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                emailRedirectTo: window.location.origin + '/dashboard',
                data: {
                    language: 'en'
                }
            }
        });
        
        if (signUpError) {
            console.log('⚠️ Signup error (might already exist):', signUpError.message);
        } else {
            console.log('✅ Test account created:', signUpData);
        }
        
        // Now try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signInError) {
            console.error('❌ Sign in failed:', signInError);
            return false;
        }
        
        console.log('✅ Test account login successful:', signInData);
        
        // Create/update profile
        if (signInData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: signInData.user.id,
                    email: testEmail,
                    language: 'en',
                    updated_at: new Date().toISOString()
                });
                
            if (profileError) {
                console.warn('⚠️ Profile creation warning:', profileError);
            } else {
                console.log('✅ Test profile created');
            }
        }
        
        return true;
        
    } catch (err) {
        console.error('❌ Test account creation failed:', err);
        return false;
    }
}

// Step 3: Bypass email confirmation if needed
async function bypassEmailConfirmation() {
    console.log('📧 Checking email confirmation bypass...');
    
    try {
        // This would typically be done in Supabase dashboard
        // But we can check current auth state
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && !user.email_confirmed_at) {
            console.log('⚠️ Email not confirmed. Manual dashboard fix needed.');
            console.log('🔧 Go to Supabase Dashboard → Authentication → Settings');
            console.log('🔧 Disable "Enable email confirmations"');
            console.log('🔧 Enable "Enable auto-confirm users"');
            return false;
        }
        
        console.log('✅ Email confirmation bypassed or confirmed');
        return true;
        
    } catch (err) {
        console.error('❌ Email confirmation check failed:', err);
        return false;
    }
}

// Step 4: Test full authentication flow
async function testFullAuthFlow() {
    console.log('🔄 Testing full authentication flow...');
    
    try {
        // Test logout
        await supabase.auth.signOut();
        console.log('✅ Logout successful');
        
        // Test login
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'test@mixandmingle.app',
            password: 'TestPassword123!'
        });
        
        if (error) {
            console.error('❌ Full flow test failed:', error);
            return false;
        }
        
        console.log('✅ Full authentication flow working');
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
        
        return true;
        
    } catch (err) {
        console.error('❌ Full flow test error:', err);
        return false;
    }
}

// Step 5: Provide manual override
function manualAuthOverride() {
    console.log('🚨 MANUAL AUTH OVERRIDE - Use this to bypass auth for UI testing');
    
    // Set fake user in localStorage for UI testing
    const fakeUser = {
        id: 'fake-user-id',
        email: 'test@mixandmingle.app',
        user_metadata: { language: 'en' }
    };
    
    localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'fake-token',
        user: fakeUser
    }));
    
    localStorage.setItem('userLanguage', 'en');
    
    console.log('✅ Manual override set. Refresh page to test UI.');
    console.log('⚠️ This bypasses real auth - only for UI testing!');
}

// Main execution function
async function runEmergencyAuthFix() {
    console.log('🚀 Running emergency auth fix...');
    
    const supabaseOk = await checkSupabaseConnection();
    if (!supabaseOk) {
        console.log('❌ Supabase connection failed. Check your environment variables.');
        console.log('🔧 Required vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return;
    }
    
    const emailOk = await bypassEmailConfirmation();
    const accountOk = await createTestAccount();
    
    if (accountOk && emailOk) {
        await testFullAuthFlow();
    } else {
        console.log('⚠️ Auth issues detected. Providing manual override...');
        manualAuthOverride();
        
        console.log('\n📋 MANUAL FIXES NEEDED:');
        console.log('1. Go to Supabase Dashboard → Authentication → Settings');
        console.log('2. Disable "Enable email confirmations"');
        console.log('3. Enable "Enable auto-confirm users"');
        console.log('4. Check Site URL matches: http://localhost:3000');
        console.log('5. Check Redirect URLs include: http://localhost:3000/dashboard');
        console.log('\n🔄 Then run this script again');
    }
}

// Expose functions globally for manual use
window.authFix = {
    run: runEmergencyAuthFix,
    createAccount: createTestAccount,
    testFlow: testFullAuthFlow,
    override: manualAuthOverride,
    check: checkSupabaseConnection
};

console.log('🛠️ Emergency auth fix loaded. Run authFix.run() to start');
console.log('📖 Available commands:');
console.log('  authFix.run() - Full emergency fix');
console.log('  authFix.createAccount() - Create test account');
console.log('  authFix.testFlow() - Test login/logout');
console.log('  authFix.override() - Manual UI testing bypass');
console.log('  authFix.check() - Check Supabase connection');

// Auto-run on load
runEmergencyAuthFix();
