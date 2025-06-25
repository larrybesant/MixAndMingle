"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import {
  AlertTriangle,
  CheckCircle,
  Database,
  ExternalLink,
  Copy,
  Play,
  User,
} from "lucide-react";

export default function AuthFixPage() {
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [authTestResult, setAuthTestResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- CRITICAL: Run this SQL in your Supabase Dashboard SQL Editor
-- This will fix authentication issues by creating required tables

-- 1. Create profiles table (required for user registration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  music_preferences TEXT[],
  is_dj BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Success message
SELECT 'Database setup completed successfully! 🎉 You can now create accounts and log in.' as status;`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const testAuth = async () => {
    setIsTestingAuth(true);
    try {
      // Test basic auth connection
      const { data: user } = await supabase.auth.getUser();

      // Test profile table access
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("count")
        .limit(1);

      setAuthTestResult({
        authWorking: true,
        profileTableExists: !profileError,
        error: profileError?.message,
        canSignup: !profileError,
      });
    } catch (error) {
      setAuthTestResult({
        authWorking: false,
        error: error instanceof Error ? error.message : "Unknown error",
        canSignup: false,
      });
    } finally {
      setIsTestingAuth(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <h1 className="text-4xl font-bold text-white">
              🚨 Auth Fix Required
            </h1>
          </div>
          <p className="text-white/70 text-lg">
            Can't create accounts or log in? Let's fix this in 2 minutes!
          </p>
        </div>

        {/* The Problem */}
        <Card className="bg-red-900/20 border-red-500/30">
          <div className="p-6">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>The Problem</span>
            </h2>
            <div className="text-red-300 space-y-2">
              <p>
                ❌ Authentication failing because the{" "}
                <code className="bg-black/50 px-2 py-1 rounded">profiles</code>{" "}
                table doesn't exist
              </p>
              <p>❌ Users can't sign up or log in</p>
              <p>❌ Database tables are missing</p>
            </div>
          </div>
        </Card>

        {/* The Solution */}
        <Card className="bg-green-900/20 border-green-500/30">
          <div className="p-6">
            <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>The Solution (2 minutes)</span>
            </h2>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-white font-medium">
                    Open Supabase Dashboard
                  </h3>
                </div>
                <Button
                  onClick={() =>
                    window.open("https://supabase.com/dashboard", "_blank")
                  }
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
              </div>

              {/* Step 2 */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-white font-medium">Go to SQL Editor</h3>
                </div>
                <p className="text-white/70 text-sm">
                  In your Supabase project, click on "SQL Editor" in the left
                  sidebar
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-white font-medium">
                    Copy & Run This SQL
                  </h3>
                </div>

                <div className="bg-black/50 p-4 rounded-lg mb-3">
                  <pre className="text-green-400 text-sm overflow-x-auto whitespace-pre-wrap">
                    {sqlScript}
                  </pre>
                </div>

                <Button
                  onClick={copyToClipboard}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copied ? "Copied!" : "Copy SQL Script"}
                </Button>
              </div>

              {/* Step 4 */}
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <h3 className="text-white font-medium">
                    Test Authentication
                  </h3>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={testAuth}
                    disabled={isTestingAuth}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isTestingAuth ? (
                      <>Loading...</>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test Auth Now
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => window.open("/signup", "_blank")}
                    variant="outline"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Try Signup
                  </Button>
                </div>

                {authTestResult && (
                  <div
                    className={`mt-3 p-3 rounded border ${
                      authTestResult.canSignup
                        ? "border-green-500/30 bg-green-900/20"
                        : "border-red-500/30 bg-red-900/20"
                    }`}
                  >
                    <div
                      className={`font-medium ${authTestResult.canSignup ? "text-green-400" : "text-red-400"}`}
                    >
                      {authTestResult.canSignup
                        ? "✅ Auth Fixed! You can now sign up!"
                        : "❌ Still needs fixing"}
                    </div>
                    {authTestResult.error && (
                      <div className="text-sm mt-1 opacity-75">
                        Error: {authTestResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="bg-slate-800/50 border-white/10">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                onClick={() => window.open("/signup", "_blank")}
                variant="outline"
                className="flex-1"
              >
                Test Signup
              </Button>
              <Button
                onClick={() => window.open("/login", "_blank")}
                variant="outline"
                className="flex-1"
              >
                Test Login
              </Button>
              <Button
                onClick={() => window.open("/mvp", "_blank")}
                variant="outline"
                className="flex-1"
              >
                MVP Dashboard
              </Button>
            </div>
          </div>
        </Card>

        {/* Success Message */}
        <div className="text-center p-6 bg-green-900/20 border border-green-500/30 rounded-lg">
          <h3 className="text-green-400 font-bold text-lg mb-2">
            🎉 After running the SQL script, your authentication will work!
          </h3>
          <p className="text-green-300">
            Users will be able to create accounts, log in, and use all features
            of your app.
          </p>
        </div>
      </div>
    </div>
  );
}
