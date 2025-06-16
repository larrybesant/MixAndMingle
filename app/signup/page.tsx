'use client';

import React, { useState } from 'react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../contexts/auth-context';

export default function SignupPage() {
  const { signUp, signInWithProvider, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signUp(email, password);
    } catch (err: unknown) {
      const errorMsg = err && typeof err === 'object' && 'message' in err ? (err as { message?: string }).message : undefined;
      setError(errorMsg || 'Signup failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 bg-white/10 rounded shadow text-white">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Button type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</Button>
        {error && <div className="text-red-400 text-sm">{error}</div>}
      </form>
      <div className="mt-6 flex flex-col gap-2">
        <Button variant="outline" onClick={() => signInWithProvider('google')}>Sign up with Google</Button>
        <Button variant="outline" onClick={() => signInWithProvider('github')}>Sign up with GitHub</Button>
      </div>
    </div>
  );
}
