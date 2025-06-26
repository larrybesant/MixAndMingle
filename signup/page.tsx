"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
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
    setLoading(true);
    setError("");

    try {
      // Sanitize and validate inputs
      const cleanEmail = sanitizeInput(email, 100);
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        setError("All fields are required.");
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
      // Try signup with minimal options
      const signupResult = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: undefined, // Explicitly disable email redirect
          captchaToken: undefined, // Disable captcha
        },
      });

      if (signupResult.error) {
        setError(`Signup failed: ${signupResult.error.message}`);
      } else if (signupResult.data?.user) {
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
        setError(
          "Account may have been created. Please check your email or try logging in.",
        );
      }
    } catch (err: any) {
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
    <div>
      {typeof window !== "undefined" && (
        <div
          style={{
            background: "yellow",
            color: "black",
            padding: 8,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          JS/HYDRATION ACTIVE
        </div>
      )}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
        <div className="w-full max-w-md bg-black/80 border border-purple-500/30 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-6">
            Mix & Mingle Signup
          </h1>

          {/* Debug info */}
          <div className="mb-4 text-xs text-gray-500 bg-gray-900/30 p-2 rounded">
            Debug: Email: {email.length}, Password: {password.length}, Loading:{" "}
            {loading ? "true" : "false"}
          </div>

          <form
            onSubmit={(e) => {
              console.log("SIGNUP FORM SUBMIT"); // TEMP DEBUG
              e.preventDefault();
              handleSignUp(e);
            }}
            className="space-y-4"
          >
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-black/40 text-white placeholder-white/80 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12 min-h-[48px] min-w-[48px] text-base"
                style={{ minHeight: 48, minWidth: 48 }}
                aria-label="Email"
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
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-black/40 text-white placeholder-white/80 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12 min-h-[48px] min-w-[48px] text-base"
                style={{ minHeight: 48, minWidth: 48 }}
                aria-label="Password"
              />
              {password && !isValidPassword(password) && (
                <p className="text-red-400 text-xs mt-1">
                  Password must be at least 8 characters.
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
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
              asChild={false}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 min-h-[48px] min-w-[48px] text-base"
              style={{ minHeight: 48, minWidth: 48 }}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
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
              className="text-blue-400 hover:underline min-h-[24px] min-w-[24px] inline-block"
              style={{ minHeight: 24, minWidth: 24 }}
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
