'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FreshLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Basic validation
    if (!email || !password) {
      setMessage('❌ Please enter both email and password');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage('❌ Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 ${isSignup ? 'Signup' : 'Login'} attempt:`, email);

      const response = await fetch('/api/fresh-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          action: isSignup ? 'signup' : 'login' 
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${isSignup ? 'Account created' : 'Login'} successful! Redirecting...`);
        console.log('✅ Auth success:', data);
        
        // Store basic session info
        if (data.session) {
          localStorage.setItem('auth_token', data.session.access_token);
          localStorage.setItem('user_id', data.user.id);
          localStorage.setItem('user_email', data.user.email);
        }
        
        // Redirect after success
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage(`❌ ${isSignup ? 'Signup' : 'Login'} failed: ${data.error}`);
        if (data.suggestion) {
          setMessage(prev => prev + `\n💡 ${data.suggestion}`);
        }
        console.error('❌ Auth failed:', data);
      }
    } catch (error: any) {
      setMessage(`💥 Error: ${error.message}`);
      console.error('💥 Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestAccount = async () => {
    const testEmail = `fresh-${Date.now()}@example.com`;
    const testPassword = 'FreshTest123!';
    
    setEmail(testEmail);
    setPassword(testPassword);
    setIsSignup(true);
    setMessage('📝 Test credentials set. Will create account automatically...');
    
    // Auto-submit after setting values
    setTimeout(() => {
      setLoading(true);
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900/20 via-black to-green-900/20 p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-gray-700 shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-6">
          🔄 <span className="text-blue-400">Fresh Login</span>
        </h1>
        
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded">
          <p className="text-blue-200 text-sm">
            ✨ Clean, simple authentication system. No complications, just working login.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="bg-gray-800 text-white border-gray-600 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="bg-gray-800 text-white border-gray-600 focus:border-blue-500"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="signup"
              checked={isSignup}
              onChange={(e) => setIsSignup(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="signup" className="text-gray-300 text-sm">
              Create new account instead of login
            </label>
          </div>

          {message && (
            <div className="p-3 rounded bg-gray-800 border border-gray-600">
              <p className="text-gray-200 text-sm font-mono whitespace-pre-line">{message}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {isSignup ? 'Creating Account...' : 'Logging In...'}
              </div>
            ) : (
              isSignup ? '📝 Create Account' : '🔐 Login'
            )}
          </Button>

          <Button
            type="button"
            onClick={createTestAccount}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            ⚡ Create Test Account & Login
          </Button>

          <Button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white text-sm"
          >
            🏠 Skip to Dashboard
          </Button>
        </form>

        <div className="mt-6 p-3 bg-gray-800 rounded text-xs text-gray-400">
          <p><strong>Fresh Login Features:</strong></p>
          <p>• Clean authentication API</p>
          <p>• Auto-confirmed accounts (no email verification)</p>
          <p>• Detailed error messages</p>
          <p>• Test account creation</p>
          <p>• Simple session management</p>
        </div>
      </div>
    </div>
  );
}
