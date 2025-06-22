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
  const router = useRouter();

  const checkProfileAndRedirect = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (!profileData || !profileData.username || !profileData.bio || !profileData.music_preferences || !profileData.avatar_url) {
      router.push("/create-profile");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogin = async () => {
    setError("");
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Login failed. Check email and password.');
    } else if (data.user) {
      if (!data.user.email_confirmed_at) {
        setError('Please verify your email before logging in. Check your inbox for a verification link.');
        await supabase.auth.signOut();
        return;
      }
      await checkProfileAndRedirect(data.user.id);
    }
  };

  const handleOAuth = async (provider: 'google') => {
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        setError(`OAuth login failed: ${error.message}`);
      } else {
        // The user will be redirected to /dashboard after OAuth
      }
    } catch (err: any) {
      setError(`OAuth login error: ${err.message || err}`);
    }
  };

  useEffect(() => {
    async function checkOnMount() {
      const { data, error } = await supabase.auth.getUser();
      // Only show error if user is on a protected page, not on /login
      if (error && error.message !== 'User not found' && window.location.pathname !== '/login') {
        setError("There was a problem with your session. Please sign in again or contact support if this continues.");
      }
      if (data.user) {
        if (!data.user.email_confirmed_at) {
          setError('Please verify your email before logging in. Check your inbox for a verification link.');
          await supabase.auth.signOut();
          return;
        }
        await checkProfileAndRedirect(data.user.id);
      }
    }
    checkOnMount();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-xs sm:max-w-sm w-full space-y-6">
        <h1 className="text-center text-2xl font-bold text-white">Sign In</h1>

        <Input
          type="email"
          placeholder="Email"
          className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm">{error} <br />
          <a href="/login" className="underline text-blue-400">Try again</a> or <a href="mailto:beta@djmixandmingle.com" className="underline text-blue-400">Contact support</a>
        </p>}

        <Button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign In
        </Button>

        {/* Social Sign-In Buttons */}
        <div className="space-y-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100"
          >
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
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
