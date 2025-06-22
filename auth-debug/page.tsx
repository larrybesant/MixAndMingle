"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { 
  CheckCircle, 
  AlertTriangle, 
  User,
  Key,
  Database,
  Settings,
  RefreshCw
} from 'lucide-react';

interface AuthDiagnostic {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

export default function AuthDebugPage() {
  const [diagnostics, setDiagnostics] = useState<AuthDiagnostic[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const [signupResult, setSignupResult] = useState<any>(null);
  const [loginResult, setLoginResult] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: AuthDiagnostic[] = [];

    // 1. Check Environment Variables
    try {
      const hasUrl = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (hasUrl && hasKey) {
        results.push({
          name: 'Environment Variables',
          status: 'pass',
          message: 'Supabase environment variables are configured',
          details: { url: !!hasUrl, key: !!hasKey }
        });
      } else {
        results.push({
          name: 'Environment Variables',
          status: 'fail',
          message: 'Missing Supabase environment variables',
          details: { url: hasUrl, key: hasKey }
        });
      }
    } catch (error) {
      results.push({
        name: 'Environment Variables',
        status: 'fail',
        message: 'Error checking environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 2. Check Supabase Client Initialization
    try {
      const session = await supabase.auth.getSession();
      results.push({
        name: 'Supabase Client',
        status: 'pass',
        message: 'Supabase client initialized successfully',
        details: { hasSession: !!session.data.session }
      });
    } catch (error) {
      results.push({
        name: 'Supabase Client',
        status: 'fail',
        message: 'Failed to initialize Supabase client',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 3. Check Database Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        results.push({
          name: 'Database Connection',
          status: 'fail',
          message: 'Database connection failed',
          details: error.message
        });
      } else {
        results.push({
          name: 'Database Connection',
          status: 'pass',
          message: 'Database connection successful',
          details: 'Profiles table accessible'
        });
      }
    } catch (error) {
      results.push({
        name: 'Database Connection',
        status: 'fail',
        message: 'Database connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // 4. Check Auth Configuration
    try {
      const { data } = await supabase.auth.getUser();
      results.push({
        name: 'Auth Configuration',
        status: 'pass',
        message: 'Auth service is accessible',
        details: { currentUser: !!data.user }
      });
    } catch (error) {
      results.push({
        name: 'Auth Configuration',
        status: 'fail',
        message: 'Auth service error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const testSignup = async () => {
    setSignupResult(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { username: 'testuser' }
        }
      });

      setSignupResult({
        success: !error,
        data,
        error: error?.message,
        details: error || data
      });
    } catch (error) {
      setSignupResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }
  };

  const testLogin = async () => {
    setLoginResult(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      setLoginResult({
        success: !error,
        data,
        error: error?.message,
        details: error || data
      });
    } catch (error) {
      setLoginResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      });
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-green-500/30 bg-green-900/20';
      case 'fail':
        return 'border-red-500/30 bg-red-900/20';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-900/20';
      default:
        return 'border-gray-500/30 bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">🔧 Auth Troubleshooting</h1>
          <p className="text-white/70 text-lg">Diagnose authentication and signup issues</p>
        </div>

        {/* Diagnostics */}
        <Card className="bg-slate-800/50 border-white/10">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">System Diagnostics</h2>
              <Button 
                onClick={runDiagnostics}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Run Check
              </Button>
            </div>

            <div className="space-y-3">
              {diagnostics.map((diagnostic, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(diagnostic.status)}
                      <div>
                        <h4 className="text-white font-medium">{diagnostic.name}</h4>
                        <p className="text-white/70 text-sm">{diagnostic.message}</p>
                      </div>
                    </div>
                    <Badge variant={diagnostic.status === 'pass' ? 'default' : 'destructive'}>
                      {diagnostic.status}
                    </Badge>
                  </div>
                  {diagnostic.details && (
                    <div className="mt-2 p-2 bg-black/30 rounded text-xs font-mono text-white/80">
                      {JSON.stringify(diagnostic.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Auth Testing */}
        <Card className="bg-slate-800/50 border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Authentication Testing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-white text-sm mb-2 block">Test Email</label>
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="bg-slate-700/50 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-white text-sm mb-2 block">Test Password</label>
                <Input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="password123"
                  className="bg-slate-700/50 border-white/20 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Signup Test */}
              <div>
                <Button onClick={testSignup} className="w-full mb-3 bg-green-600 hover:bg-green-700">
                  <User className="w-4 h-4 mr-2" />
                  Test Signup
                </Button>
                {signupResult && (
                  <div className={`p-3 rounded border text-sm ${
                    signupResult.success 
                      ? 'border-green-500/30 bg-green-900/20 text-green-300' 
                      : 'border-red-500/30 bg-red-900/20 text-red-300'
                  }`}>
                    <div className="font-medium mb-1">
                      {signupResult.success ? '✅ Signup Success' : '❌ Signup Failed'}
                    </div>
                    {signupResult.error && <div>Error: {signupResult.error}</div>}
                    <details className="mt-2">
                      <summary className="cursor-pointer">Details</summary>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(signupResult.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>

              {/* Login Test */}
              <div>
                <Button onClick={testLogin} className="w-full mb-3 bg-blue-600 hover:bg-blue-700">
                  <Key className="w-4 h-4 mr-2" />
                  Test Login
                </Button>
                {loginResult && (
                  <div className={`p-3 rounded border text-sm ${
                    loginResult.success 
                      ? 'border-green-500/30 bg-green-900/20 text-green-300' 
                      : 'border-red-500/30 bg-red-900/20 text-red-300'
                  }`}>
                    <div className="font-medium mb-1">
                      {loginResult.success ? '✅ Login Success' : '❌ Login Failed'}
                    </div>
                    {loginResult.error && <div>Error: {loginResult.error}</div>}
                    <details className="mt-2">
                      <summary className="cursor-pointer">Details</summary>
                      <pre className="mt-1 text-xs overflow-x-auto">
                        {JSON.stringify(loginResult.details, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Fixes */}
        <Card className="bg-slate-800/50 border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Common Issues & Fixes</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-medium mb-2">❌ Missing Environment Variables</h3>
                <p className="text-white/70 text-sm mb-2">
                  Make sure your .env.local file contains:
                </p>
                <pre className="bg-black/50 p-2 rounded text-green-400 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
                </pre>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-medium mb-2">❌ Database Not Set Up</h3>
                <p className="text-white/70 text-sm mb-2">
                  Run the database setup:
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => window.open('/mvp', '_blank')}>
                    Open MVP Dashboard
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => window.open('/api/auto-setup-db', '_blank')}>
                    Auto Setup Database
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h3 className="text-white font-medium mb-2">❌ Email Confirmation Issues</h3>
                <p className="text-white/70 text-sm">
                  Check your Supabase dashboard Authentication settings:
                </p>
                <ul className="text-white/60 text-sm mt-2 ml-4 space-y-1">
                  <li>• Email confirmation may be required</li>
                  <li>• Check spam folder for confirmation emails</li>
                  <li>• Disable email confirmation for testing</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
