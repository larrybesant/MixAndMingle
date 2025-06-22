'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function ForceLogin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const forceLogin = async () => {
    setLoading(true);
    setMessage('🚨 Forcing login - bypassing ALL authentication...');

    try {
      const response = await fetch('/api/force-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: 'force@example.com', 
          password: 'bypass' 
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ FORCE LOGIN SUCCESS! Redirecting to dashboard...');
        console.log('✅ Force login successful:', data);
        
        // Force redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setMessage(`❌ Force login failed: ${data.error}`);
      }
    } catch (error: any) {
      setMessage(`💥 Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goToDashboard = () => {
    setMessage('🏠 Going directly to dashboard...');
    window.location.href = '/dashboard';
  };

  const goToCreateProfile = () => {
    setMessage('👤 Going to create profile...');
    window.location.href = '/create-profile';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900/20 via-black to-red-900/20 p-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-lg border border-red-500/50">
        <h1 className="text-2xl font-bold text-red-400 mb-6 text-center">
          ⚡ FORCE ACCESS SYSTEM
        </h1>
        
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded">
          <p className="text-red-200 text-sm font-bold">
            🚨 NUCLEAR OPTION: This completely bypasses authentication and gets you into your app immediately.
          </p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded bg-gray-800 border border-gray-600">
            <p className="text-gray-200 text-sm font-mono">{message}</p>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={forceLogin}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {loading ? 'FORCING ACCESS...' : '⚡ FORCE LOGIN NOW'}
          </Button>

          <Button
            onClick={goToDashboard}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            🏠 GO DIRECTLY TO DASHBOARD
          </Button>

          <Button
            onClick={goToCreateProfile}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            👤 GO TO CREATE PROFILE
          </Button>

          <div className="mt-6 p-3 bg-gray-800 rounded text-xs text-gray-400">
            <p><strong>What this does:</strong></p>
            <p>• Completely bypasses Supabase authentication</p>
            <p>• Creates a fake session to access your app</p>
            <p>• Gets you into the dashboard immediately</p>
            <p>• No passwords, no email verification, no errors</p>
          </div>

          <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded">
            <p className="text-yellow-200 text-xs">
              <strong>Note:</strong> This is a temporary bypass to get you working. Once you're in, you can debug the real authentication issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
