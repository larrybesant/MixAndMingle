'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

export default function SignupPage() {
  const [djName, setDjName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://v0-m-and-m-mvp-5d-82uexu1b5-larrybesants-projects.vercel.app/dashboard',
        data: { dj_name: djName },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      console.error('OAuth signup failed:', error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Sign Up</h1>

        <input
          type="text"
          placeholder="DJ Name"
          value={djName}
          onChange={(e) => setDjName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={handleSignUp}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          Sign Up
        </button>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded text-sm bg-white text-black hover:bg-gray-100"
          >
            <Image src="/icons/google.svg" alt="Google" width={20} height={20} />
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth('facebook')}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-sm"
          >
            <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} />
            Continue with Facebook
          </button>
        </div>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
