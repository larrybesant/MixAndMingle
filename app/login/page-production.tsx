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

  const checkProfileAndRedirect = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, bio, music_preferences, avatar_url, gender, relationship_style")
        .eq("id", userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        router.push("/create-profile");
        return;
      } else if (profileError) {
        router.push("/dashboard?profile_error=true");
        return;
      }
      
      const profileComplete = !!(
        profileData?.username?.trim() && 
        profileData?.bio?.trim() && 
        profileData?.music_preferences?.length > 0 &&
        profileData?.avatar_url?.trim() &&
        profileData?.gender?.trim()
      );
      
      if (!profileComplete) {
        router.push("/setup-profile");
      } else {
        router.push("/dashboard");
      }
    } catch (error: unknown) {
      console.error('Profile check error:', error);
      router.push("/dashboard?login_error=true");
    }
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      
      const { error, data } = await supabase.auth.signInWithPassword({ 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before logging in.');
        } else if (error.message.includes('User not found')) {
          setError('No account found with this email. Please sign up first.');
        } else if (error.message.includes('Too many requests')) {
          setError('Too many attempts. Please wait and try again.');
        } else {
          setError(`Login failed: ${error.message}`);
        }
      } else if (data.user) {
        await checkProfileAndRedirect(data.user.id);
      } else {
        setError('Login completed but no user data returned. Please try again.');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Unexpected error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    setError("");
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        setError(`OAuth login failed: ${error.message}`);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`OAuth login error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkOnMount() {
      const { data } = await supabase.auth.getUser();
      
      if (data.user) {
        await checkProfileAndRedirect(data.user.id);
      }
    }
    checkOnMount();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-xs sm:max-w-sm w-full space-y-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-black tracking-wider mb-2">
            <span className="text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-extrabold">MIX</span>
            <span className="text-orange-400 text-5xl mx-2 drop-shadow-[0_0_15px_rgba(251,146,60,0.8)] font-serif transform rotate-6 inline-block">𝄞</span>
            <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] font-extrabold">MINGLE</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to continue your musical journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <Input
            type="password"
            placeholder="Password"
            className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleLogin();
              }
            }}
          />

          <Button
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </div>
            ) : 'Sign In'}
          </Button>
        </div>

        {/* Social Sign-In */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuth('google')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white/10 border-gray-600 text-white hover:bg-white/20 disabled:opacity-50 py-3 rounded-xl"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Redirecting...
            </>
          ) : (
            <>
              <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
              Continue with Google
            </>
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
              Sign Up
            </a>
          </p>
          <p className="text-xs text-gray-500">
            <a href="/forgot-password" className="hover:text-gray-400 transition-colors">
              Forgot Password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
