'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function QuickSignupPage() {
  const [email, setEmail] = useState('larrybesant@gmail.com');
  const [password, setPassword] = useState('testpassword123');
  const [username, setUsername] = useState('larry');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    setLoading(true);
    setResult('Creating account...');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            username: username,
            created_via: 'quick_signup'
          }
        }
      });

      if (error) {
        setResult(`❌ Error: ${error.message}`);
        if (error.message.includes('already registered')) {
          setResult(`✅ Account already exists! Try logging in at /login`);
        }
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          setResult(`✅ Account created and confirmed! You can now login at /login`);
        } else {
          setResult(`✅ Account created! Check your email for verification, then login at /login`);
        }
      }
    } catch (err: any) {
      setResult(`❌ Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Quick Account Creation</h1>
        
        <div className="space-y-4">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900/50 border-gray-600 text-white"
          />
          
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900/50 border-gray-600 text-white"
          />
          
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900/50 border-gray-600 text-white"
          />
          
          <Button
            onClick={createAccount}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </Button>
          
          {result && (
            <div className={`p-3 rounded text-sm ${
              result.includes('✅') 
                ? 'bg-green-900/20 border border-green-500 text-green-400'
                : 'bg-red-900/20 border border-red-500 text-red-400'
            }`}>
              {result}
            </div>
          )}
          
          <div className="text-center space-x-4 text-sm">
            <a href="/login" className="text-blue-400 hover:underline">Go to Login</a>
            <a href="/signup" className="text-purple-400 hover:underline">Full Signup</a>
          </div>
        </div>
      </div>
    </div>
  );
}
