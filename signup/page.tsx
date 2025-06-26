"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Helper to sanitize input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 100): string {
    return input
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  // Helper to validate username (alphanumeric, underscores, 3-20 chars)
  function isValidUsername(name: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(name);
  }

  // Helper to validate email
  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  // Helper to validate password (min 8 chars)
  function isValidPassword(pw: string): boolean {
    return pw.length >= 8;
  }
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Form submitted!"); // Debug log
    setLoading(true);
    setError("");

    try {
      // Sanitize and validate inputs
      const cleanUsername = sanitizeInput(username, 20);
      const cleanEmail = sanitizeInput(email, 100);
      const cleanPassword = password.trim();

      console.log("📝 Form data:", {
        cleanUsername,
        cleanEmail,
        passwordLength: cleanPassword.length,
      }); // Debug log

      if (!cleanUsername || !cleanEmail || !cleanPassword) {
        setError("All fields are required.");
        setLoading(false);
        return;
      }

      if (!isValidUsername(cleanUsername)) {
        setError(
          "Username must be 3-20 characters, letters, numbers, or underscores only.",
        );
        setLoading(false);
        return;
      }

      if (!isValidEmail(cleanEmail)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }

      if (!isValidPassword(cleanPassword)) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      console.log("🔐 Attempting signup with Supabase..."); // Debug log
      // Try signup with minimal options to bypass webhook issues
      const signupResult = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { username: cleanUsername },
          emailRedirectTo: undefined, // Explicitly disable email redirect
          captchaToken: undefined, // Disable captcha
        },
      });

      console.log("📧 Signup result:", signupResult); // Debug log

      if (signupResult.error) {
        console.error("❌ Signup error:", signupResult.error); // Debug log
        setError(`Signup failed: ${signupResult.error.message}`);
      } else if (signupResult.data?.user) {
        console.log("✅ Signup successful! User:", signupResult.data.user.id); // Debug log
        setError(""); // Clear any errors

        // Check if user needs email confirmation
        if (!signupResult.data.user.email_confirmed_at) {
          setError("✅ Account created! Redirecting to email verification...");
          setTimeout(() => {
            router.push("/signup/check-email");
          }, 1000);
        } else {
          // User is immediately confirmed, redirect to dashboard
          setError("✅ Account created! Redirecting to dashboard...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } else {
        console.log("⚠️ Signup completed but no user data returned"); // Debug log
        setError(
          "Account may have been created. Please check your email or try logging in.",
        );
      }
    } catch (err: any) {
      console.error("💥 Unexpected error:", err); // Debug log
      setError(`Unexpected error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google") => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(`OAuth signup failed: ${error.message}`);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-6">
          Mix & Mingle Signup
        </h1>

        {/* Debug info */}
        <div className="mb-4 text-xs text-gray-500 bg-gray-900/30 p-2 rounded">
          Debug: Username: {username.length}, Email: {email.length}, Password:{" "}
          {password.length}, Loading: {loading ? "true" : "false"}
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Input
              placeholder="Username (3-20 characters)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
              autoComplete="username"
              required
            />
            {username && !isValidUsername(username) && (
              <p className="text-red-400 text-xs mt-1">
                Username must be 3-20 characters, letters, numbers, or
                underscores only.
              </p>
            )}
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
              autoComplete="email"
              required
            />
            {email && !isValidEmail(email) && (
              <p className="text-red-400 text-xs mt-1">
                Please enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
              autoComplete="new-password"
              required
            />{" "}
            {password && !isValidPassword(password) && (
              <p className="text-red-400 text-xs mt-1">
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          {error && (
            <div
              className={`mb-4 text-sm p-3 border rounded ${
                error.includes("✅")
                  ? "text-green-400 bg-green-900/20 border-green-500"
                  : "text-red-400 bg-red-900/20 border-red-500"
              }`}
            >
              {error}
            </div>
          )}

          {/* Main signup button */}
          <Button
            type="submit"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full mb-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>
          {/* Test button for debugging */}
          <button
            type="button"
            onClick={() => {
              console.log("Test button clicked!");
              alert("Test button works!");
            }}
            className="w-full mb-2 p-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
          >
            Test Button (Click to test if buttons work)
          </button>
        </form>

        <Button
          type="button"
          onClick={() => handleOAuth("google")}
          className="w-full mb-4 bg-white text-black hover:bg-gray-100 border border-gray-300"
        >
          Sign Up with Google
        </Button>

        <div className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
