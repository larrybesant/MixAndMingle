'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function LoginTestPage() {
  const [result, setResult] = useState<string>('Click test button');
  const [loading, setLoading] = useState(false);
  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('🔧 Starting login test...');
      
      // Step 1: Check environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      console.log('Environment check:');
      console.log('URL:', supabaseUrl ? 'Present' : 'Missing');
      console.log('Key:', supabaseKey ? 'Present' : 'Missing');
      
      if (!supabaseUrl || !supabaseKey) {
        setResult('❌ Environment variables missing');
        return;
      }
      
      // Step 2: Check Supabase client
      console.log('Supabase client:', supabase);
      
      if (!supabase) {
        setResult('❌ Supabase client not initialized');
        return;
      }
      
      if (!supabase.auth) {
        setResult('❌ Supabase auth not available');
        return;
      }
      
      setResult('🔄 Environment OK, testing auth...');
      
      // Step 3: Test authentication with timeout
      console.log('📧 Attempting login...');
      
      const loginPromise = supabase.auth.signInWithPassword({
        email: 'larrybesant@gmail.com',
        password: 'MixMingle2024!'
      });
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout after 10 seconds')), 10000)
      );
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ Login error:', error);
        setResult(`❌ Login failed: ${error.message}`);
      } else {
        console.log('✅ Login success:', data);
        setResult(`✅ Login successful! User: ${data.user?.email}`);
        
        // Sign out for testing
        await supabase.auth.signOut();
      }
      
    } catch (err: any) {
      console.error('❌ Test error:', err);
      setResult(`❌ Test error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={testLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        
        <div className="p-4 bg-gray-100 rounded min-h-[100px]">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          <p className="text-sm">{result}</p>
        </div>
        
        <div className="text-xs text-gray-600">
          <p>This tests if Supabase authentication works in your browser.</p>
          <p>Check browser console (F12) for detailed logs.</p>
        </div>
      </div>
    </div>
  );
}
