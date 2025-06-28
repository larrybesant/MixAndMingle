"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Redirect to demo login page
    router.replace("/demo-login");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const { supabase } = await import("@/lib/supabase/client");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        setError("");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setError(
        `Connection error: ${err instanceof Error ? err.message : "Please try again"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-6">
          Mix & Mingle Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
            autoComplete="email"
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
            autoComplete="current-password"
            required
          />
          {error && (
            <div className="mb-4 text-sm p-3 border rounded text-red-400 bg-red-900/20 border-red-500">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <div className="text-center text-sm text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <a
            href="/signup"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
