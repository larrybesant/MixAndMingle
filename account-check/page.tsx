'use client';

export const dynamic = "force-dynamic";

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AccountCheckPage() {
  const [email, setEmail] = useState('larrybesant@gmail.com');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkAccount = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Try to sign in to see what error we get
      const { error, data } = await supabase.auth.signInWithPassword({
        email: email,
        password: 'dummy_password_to_test'
      });

      const accountInfo = {
        timestamp: new Date().toISOString(),
        email: email,
        signInError: error?.message || 'No error',
        userExists: !error?.message?.includes('User not found'),
        needsVerification: error?.message?.includes('Email not confirmed') || error?.message?.includes('verify'),
        invalidCredentials: error?.message?.includes('Invalid login credentials'),
        analysis: ''
      };

      // Analyze the error
      if (accountInfo.invalidCredentials) {
        accountInfo.analysis = '✅ Account exists but password is wrong. Use "Forgot Password" to reset it.';
      } else if (accountInfo.needsVerification) {
        accountInfo.analysis = '⚠️ Account exists but email needs verification. Check your inbox.';
      } else if (!accountInfo.userExists) {
        accountInfo.analysis = '❌ Account does not exist. Use "Sign Up" to create it.';
      } else {
        accountInfo.analysis = '🤔 Unknown issue. Check the error details.';
      }

      setResult(accountInfo);

    } catch (err: any) {
      setResult({
        error: err.message,
        analysis: '💥 Unexpected error occurred.'
      });
    } finally {
      setLoading(false);
    }
  };

  const quickFix = async (action: string) => {
    setLoading(true);
    try {
      if (action === 'resendVerification') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });
        if (error) {
          setResult({...result, quickFixResult: `❌ Failed: ${error.message}`});
        } else {
          setResult({...result, quickFixResult: '✅ Verification email sent!'});
        }
      } else if (action === 'resetPassword') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
          setResult({...result, quickFixResult: `❌ Failed: ${error.message}`});
        } else {
          setResult({...result, quickFixResult: '✅ Password reset email sent!'});
        }
      }
    } catch (err: any) {
      setResult({...result, quickFixResult: `❌ Error: ${err.message}`});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Account Diagnostics</h1>
        
        <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">Check Account Status</h2>
          
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Email to check"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-900/50 border-gray-600 text-white"
            />
            
            <Button
              onClick={checkAccount}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Checking...' : 'Check Account Status'}
            </Button>
          </div>
        </div>
        
        {result && (
          <div className="bg-black/40 border border-purple-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Results</h3>
            
            <div className="space-y-3 text-white">
              <div className="bg-gray-900/50 p-4 rounded">
                <h4 className="font-semibold text-yellow-400">Analysis:</h4>
                <p>{result.analysis}</p>
              </div>
              
              {result.quickFixResult && (
                <div className="bg-gray-900/50 p-4 rounded">
                  <h4 className="font-semibold text-green-400">Quick Fix Result:</h4>
                  <p>{result.quickFixResult}</p>
                </div>
              )}
              
              <details className="bg-gray-900/50 p-4 rounded">
                <summary className="cursor-pointer font-semibold text-blue-400">Technical Details</summary>
                <pre className="mt-2 text-xs overflow-auto text-gray-300">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
            
            {/* Quick fix buttons */}
            {result.needsVerification && (
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => quickFix('resendVerification')}
                  disabled={loading}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}
            
            {result.invalidCredentials && (
              <div className="mt-4 space-y-2">
                <Button
                  onClick={() => quickFix('resetPassword')}
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Send Password Reset Email
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-4">
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Login
          </a>
          <a 
            href="/signup" 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create New Account
          </a>
        </div>
      </div>
    </div>
  );
}
