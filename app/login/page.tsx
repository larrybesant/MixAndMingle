'use client';

import { useState } from 'react';
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

  const handleLogin = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError('Login failed. Check email and password.');
    } else {
      // Admin redirect
      if (data.user && data.user.email === "larrybesant@gmail.com") {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      console.error('OAuth login failed:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-sm w-full space-y-6">
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Sign In
        </Button>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100"
          >
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </Button>

          <Button
            type="button"
            onClick={() => handleOAuth('facebook')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
          >
            <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} />
            Continue with Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-white">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
        <p className="text-center text-xs text-gray-400">
          <a href="/forgot-password" className="hover:underline">
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
}
