'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EmergencyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (action: 'login' | 'signup') => {
    setLoading(true);
    setMessage('');

    try {
      console.log(`🚨 Emergency ${action} attempt:`, email);

      const response = await fetch('/api/emergency-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, action })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ ${action} successful! Redirecting...`);
        console.log('✅ Emergency auth success:', data);
        
        // Force redirect after success
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage(`❌ ${action} failed: ${data.error}`);
        console.error('❌ Emergency auth failed:', data);
      }
    } catch (error: any) {
      setMessage(`💥 Error: ${error.message}`);
      console.error('💥 Emergency auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestAccount = async () => {
    const testEmail = `emergency-${Date.now()}@example.com`;
    const testPassword = 'Emergency123!';
    
    setEmail(testEmail);
    setPassword(testPassword);
    setMessage('📝 Test credentials set. Click Login or Signup.');
    
    // Auto-signup after 2 seconds
    setTimeout(() => {
      handleAuth('signup');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          🚨 Emergency Login System
        </h1>
        
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded">
          <p className="text-blue-200 text-sm">
            This bypasses all authentication issues. Use this to get into your app immediately.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="bg-gray-800 text-white border-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="bg-gray-800 text-white border-gray-600"
            />
          </div>

          {message && (
            <div className="p-3 rounded bg-gray-800 border border-gray-600">
              <p className="text-gray-200 text-sm font-mono">{message}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => handleAuth('login')}
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Processing...' : '🔐 Emergency Login'}
            </Button>

            <Button
              onClick={() => handleAuth('signup')}
              disabled={loading || !email || !password}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Processing...' : '📝 Emergency Signup'}
            </Button>

            <Button
              onClick={createTestAccount}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              ⚡ Create Test Account & Login
            </Button>

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-xs"
            >
              🏠 Force Go to Dashboard
            </Button>
          </div>

          <div className="mt-6 p-3 bg-gray-800 rounded text-xs text-gray-400">
            <p><strong>Debug Info:</strong></p>
            <p>• Email: {email || 'Not entered'}</p>
            <p>• Password: {password ? `${password.length} characters` : 'Not entered'}</p>
            <p>• Status: {loading ? 'Processing...' : 'Ready'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
