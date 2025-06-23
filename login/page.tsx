'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Debug info - add this temporarily
  useEffect(() => {
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🔗 OAuth redirect will be:', `${window.location.origin}/auth/callback`);
  }, []);  const checkProfileAndRedirect = async (userId: string) => {
    try {
      console.log("🔍 Checking user profile for:", userId);
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, bio, music_preferences, avatar_url, gender, relationship_style")
        .eq("id", userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // No profile exists - redirect to create profile
        console.log("📝 No profile found, redirecting to create-profile");
        router.push("/create-profile");
        return;
      } else if (profileError) {
        console.log("⚠️ Profile fetch error:", profileError.message);
        // On error, let user access dashboard but show a notification
        router.push("/dashboard?profile_error=true");
        return;
      }
      
      // Check profile completion - simplified logic
      const profileComplete = !!(
        profileData?.username?.trim() && 
        profileData?.bio?.trim() && 
        profileData?.music_preferences?.trim() &&
        profileData?.avatar_url?.trim() &&
        profileData?.gender?.trim()
      );
      
      console.log("📊 Profile completion check:", {
        hasUsername: !!profileData?.username?.trim(),
        hasBio: !!profileData?.bio?.trim(),
        hasMusicPrefs: !!profileData?.music_preferences?.trim(),
        hasAvatar: !!profileData?.avatar_url?.trim(),
        hasGender: !!profileData?.gender?.trim(),
        isComplete: profileComplete
      });
      
      if (!profileComplete) {
        console.log("🔧 Profile incomplete, redirecting to setup");
        router.push("/setup-profile");
      } else {
        console.log("✅ Profile complete, redirecting to dashboard");
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("💥 Error checking profile:", error);
      // Fallback to dashboard with error flag
      router.push("/dashboard?login_error=true");
    }
  };const handleLogin = async () => {
    setError("");
    setLoading(true);    console.log("🔐 Attempting login...", { 
      email, 
      passwordLength: password.length,
      timestamp: new Date().toISOString()
    });
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
      try {
      // Clear any existing session first
      await supabase.auth.signOut();
      
      console.log("🔐 Starting login process...");
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log("📧 Login result:", { 
        error: error?.message, 
        userId: data?.user?.id,
        emailConfirmed: data?.user?.email_confirmed_at,
        userEmail: data?.user?.email,
        hasSession: !!data?.session,
        sessionExpiry: data?.session?.expires_at
      });
      
      if (error) {
        console.error("❌ Login error:", error);
        
        // More specific error handling with actionable advice
        if (error.message.includes('Invalid login credentials')) {
          setError('❌ Invalid email or password. Please double-check your credentials. If you just signed up, your account is ready to use immediately (no email verification needed).');
        } else if (error.message.includes('Email not confirmed')) {
          setError('📧 Please verify your email before logging in. Check your inbox for a verification link.');
        } else if (error.message.includes('User not found')) {
          setError('👤 No account found with this email. Please sign up first or check your email address.');
        } else if (error.message.includes('Too many requests')) {
          setError('⏰ Too many login attempts. Please wait a moment and try again.');
        } else {
          setError(`❌ Login failed: ${error.message}`);
        }
        
      } else if (data.user) {
        console.log("✅ Login successful! User:", data.user.id);
        
        // Since email verification is disabled, users should be immediately confirmed
        // But let's handle both cases gracefully
        if (!data.user.email_confirmed_at) {
          console.warn("⚠️ User not confirmed, but verification is disabled");
          // Don't block login since verification is disabled
        }
          setError("✅ Login successful! Redirecting...");
        
        // Add a timeout to prevent hanging
        try {
          await Promise.race([
            checkProfileAndRedirect(data.user.id),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Redirect timeout')), 10000)
            )
          ]);
        } catch (redirectError: any) {
          console.error("🔄 Redirect error:", redirectError);
          if (redirectError.message === 'Redirect timeout') {
            setError("Redirect is taking too long. Trying dashboard...");
            router.push("/dashboard");
          } else {
            setError("Redirect failed. Trying dashboard...");
            router.push("/dashboard");
          }
        }
      } else {
        console.error("⚠️ Login completed but no user data returned");
        setError('⚠️ Login completed but no user data returned. Please try again or contact support.');
      }
    } catch (err: any) {
      console.error("💥 Unexpected login error:", err);
      setError(`💥 Unexpected error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    setError("");
    setLoading(true);
    
    try {
      console.log('🔐 Starting OAuth with redirect to:', `${window.location.origin}/auth/callback`);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      if (error) {
        console.error('❌ OAuth error:', error);
        setError(`OAuth login failed: ${error.message}`);
      }
    } catch (err: any) {
      console.error('💥 OAuth exception:', err);
      setError(`OAuth login error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    async function checkOnMount() {
      const { data, error } = await supabase.auth.getUser();
      
      if (data.user) {
        console.log('🔍 User already logged in, redirecting...', data.user.id);
        // Since email verification is disabled, redirect immediately
        await checkProfileAndRedirect(data.user.id);
      }
      
      // Don't show session errors on the login page
      if (error && error.message !== 'User not found') {
        console.log('ℹ️ No active session (this is normal on login page)');
      }
    }
    checkOnMount();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-xs sm:max-w-sm w-full space-y-6">
        <h1 className="text-center text-2xl font-bold text-white">Sign In</h1>
          {/* Debug section - helpful info */}
        <div className="text-xs text-gray-400 bg-gray-900/30 p-3 rounded">
          <div className="font-semibold mb-2 text-cyan-400">🔧 Login Troubleshooting:</div>
          <div className="space-y-1">
            <div>✅ Email verification: Disabled (instant login)</div>
            <div>✅ Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Connected' : 'Missing config'}</div>
            <div>📧 Email: {email.length > 0 ? `${email.length} characters` : 'Not entered'}</div>
            <div>🔑 Password: {password.length > 0 ? `${password.length} characters` : 'Not entered'}</div>
            {loading && <div className="text-yellow-400">⏳ Signing in...</div>}
          </div>
          <div className="mt-2 text-green-400 text-xs">
            💡 Tip: If you just signed up, you can login immediately - no email verification needed!
          </div>
        </div>

        <Input
          type="email"
          placeholder="Email"
          className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />        <Input
          type="password"
          placeholder="Password"
          className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && email && password && !loading) {
              e.preventDefault();
              handleLogin();
            }
          }}
        />

        {error && (
          <div className="text-red-500 text-sm bg-red-900/20 border border-red-500/30 p-3 rounded">
            {error}
            
            {/* Show helpful actions based on error type */}
            {error.includes('verify your email') && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.resend({
                      type: 'signup',
                      email: email,
                    });
                    if (error) {
                      setError(`Failed to resend verification: ${error.message}`);
                    } else {
                      setError('✅ Verification email sent! Check your inbox.');
                    }
                  }}
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700 h-8"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}
              <div className="mt-2 space-x-2">
              <a href="/login" className="underline text-blue-400">Try again</a>
              <span className="text-gray-400">or</span>
              <a href="/signup" className="underline text-green-400">Create Account</a>
              <span className="text-gray-400">or</span>
              <a href="/forgot-password" className="underline text-purple-400">Reset Password</a>
              <span className="text-gray-400">or</span>
              <a href="mailto:beta@djmixandmingle.com" className="underline text-blue-400">Contact support</a>            </div>
          </div>
        )}        <Button
          onClick={(e) => {
            console.log("🖱️ Button clicked! Event:", e);
            console.log("📧 Email:", email, "Password length:", password.length);
            console.log("⏳ Current loading state:", loading);
            handleLogin();
          }}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing In...
            </div>
          ) : 'Sign In'}
        </Button>

        {/* Emergency reset if stuck in loading */}
        {loading && (
          <div className="text-xs text-center">
            <button
              type="button"
              onClick={() => {
                console.log("🔄 Emergency reset triggered");
                setLoading(false);
                setError("Login reset. Please try again.");
              }}
              className="text-red-400 hover:underline mt-2"
            >
              Stuck? Click here to reset
            </button>
          </div>
        )}

        {/* Quick Test Login - for troubleshooting */}
        <div className="border-t border-gray-700 pt-4">
          <div className="text-xs text-gray-400 mb-2 text-center">🧪 Quick Test (Troubleshooting)</div>
          <Button
            type="button"
            onClick={async () => {
              setError("");
              setLoading(true);
              
              // Create and login with a fresh test account
              try {
                const testEmail = `quicktest-${Date.now()}@example.com`;
                const testPassword = 'QuickTest123!';
                
                console.log('🧪 Creating test account for immediate login...');
                
                // Create account
                const signupResponse = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: testEmail,
                    password: testPassword,
                    username: `quicktest${Date.now()}`
                  })
                });
                
                const signupData = await signupResponse.json();
                
                if (signupResponse.ok && signupData.user) {
                  // Wait a moment then login
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  const { error, data } = await supabase.auth.signInWithPassword({
                    email: testEmail,
                    password: testPassword
                  });
                  
                  if (error) {
                    setError(`🧪 Test login failed: ${error.message}`);
                  } else if (data.user) {
                    setError(`✅ Test login successful! Redirecting...`);
                    await checkProfileAndRedirect(data.user.id);
                  }
                } else {
                  setError(`🧪 Test account creation failed: ${signupData.error}`);
                }
              } catch (err: any) {
                setError(`🧪 Test failed: ${err.message}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white text-xs py-2"
          >
            🧪 Create & Login Test Account
          </Button>
          <div className="text-xs text-gray-500 mt-1 text-center">
            This creates a new account and logs in immediately to test the system
          </div>
        </div>

        {/* Social Sign-In Buttons */}
        <div className="space-y-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Redirecting...
              </>
            ) : (
              <>
                <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
                Continue with Google
              </>
            )}
          </Button>
        </div>

        <p className="text-center text-sm text-white">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <a href="/forgot-password" className="hover:underline text-blue-400">
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
}
