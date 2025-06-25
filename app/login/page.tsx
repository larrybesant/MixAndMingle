"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Debug info - add this temporarily
  useEffect(() => {
    console.log("🌐 Current origin:", window.location.origin);
    console.log(
      "🔗 OAuth redirect will be:",
      `${window.location.origin}/auth/callback`,
    );
  }, []);

  const checkProfileAndRedirect = async (userId: string) => {
    console.log("Redirecting to /create-profile");
    router.push("/create-profile");
  };
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    console.log("🔐 Attempting login...", {
      email,
      passwordLength: password.length,
    });

    // Basic validation
    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("📧 Login result:", {
        error: error?.message,
        userId: data?.user?.id,
        emailConfirmed: data?.user?.email_confirmed_at,
        userEmail: data?.user?.email,
      });

      if (error) {
        console.error("❌ Login error:", error);

        // More specific error handling
        if (error.message.includes("Invalid login credentials")) {
          setError(
            "Invalid email or password. Please check your credentials and try again. If you just signed up, make sure to verify your email first.",
          );
        } else if (error.message.includes("Email not confirmed")) {
          setError(
            "Please verify your email before logging in. Check your inbox for a verification link.",
          );
        } else if (error.message.includes("User not found")) {
          setError("No account found with this email. Please sign up first.");
        } else {
          setError(`Login failed: ${error.message}`);
        }

        // Add helpful suggestion
        if (error.message.includes("Invalid login credentials")) {
          setError(
            (prevError) =>
              prevError +
              ' If you forgot your password, use the "Forgot Password" link below.',
          );
        }
      } else if (data.user) {
        console.log("✅ Login successful! User:", data.user.id);

        if (!data.user.email_confirmed_at) {
          setError(
            "Please verify your email before logging in. Check your inbox for a verification link. If you need a new verification email, try signing up again.",
          );
          await supabase.auth.signOut();
          return;
        }
        await checkProfileAndRedirect(data.user.id);
      } else {
        setError(
          "Login completed but no user data returned. Please try again.",
        );
      }
    } catch (err: any) {
      console.error("💥 Unexpected login error:", err);
      setError(`Unexpected error: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkOnMount() {
      const { data, error } = await supabase.auth.getUser();
      // Only show error if user is on a protected page, not on /login
      if (
        error &&
        error.message !== "User not found" &&
        window.location.pathname !== "/login"
      ) {
        setError(
          "There was a problem with your session. Please sign in again or contact support if this continues.",
        );
      }
      if (data.user) {
        if (!data.user.email_confirmed_at) {
          setError(
            "Please verify your email before logging in. Check your inbox for a verification link.",
          );
          await supabase.auth.signOut();
          return;
        }
        await checkProfileAndRedirect(data.user.id);
      }
    }
    checkOnMount();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-xs sm:max-w-sm w-full space-y-6">
        <h1 className="text-center text-2xl font-bold text-white">Sign In</h1>
        {/* Debug section - temporary */}
        <div className="text-xs text-gray-400 bg-gray-900/30 p-2 rounded">
          <div>
            Debug: Email: {email}, Password Length: {password.length}
          </div>
          <div>
            Supabase URL:{" "}
            {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"}
          </div>
        </div>
        <Input
          type="email"
          placeholder="Email"
          className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          className="w-full bg-black/40 text-white placeholder-white/60 focus:border-purple-400 focus:ring-purple-400 rounded-xl h-12"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />{" "}
        {error && (
          <div className="text-red-500 text-sm bg-red-900/20 border border-red-500/30 p-3 rounded">
            {error}

            {/* Show helpful actions based on error type */}
            {error.includes("verify your email") && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={async () => {
                    const { error } = await supabase.auth.resend({
                      type: "signup",
                      email: email,
                    });
                    if (error) {
                      setError(
                        `Failed to resend verification: ${error.message}`,
                      );
                    } else {
                      setError("✅ Verification email sent! Check your inbox.");
                    }
                  }}
                  className="w-full text-xs bg-blue-600 hover:bg-blue-700 h-8"
                >
                  Resend Verification Email
                </Button>
              </div>
            )}

            <div className="mt-2 space-x-2">
              <a href="/login" className="underline text-blue-400">
                Try again
              </a>
              <span className="text-gray-400">or</span>
              <a href="/signup" className="underline text-green-400">
                Create Account
              </a>
              <span className="text-gray-400">or</span>
              <a href="/forgot-password" className="underline text-purple-400">
                Reset Password
              </a>
              <span className="text-gray-400">or</span>
              <a
                href="mailto:beta@djmixandmingle.com"
                className="underline text-blue-400"
              >
                Contact support
              </a>
            </div>
          </div>
        )}
        <Button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
        {/* Social Sign-In Buttons */}
        <div className="space-y-3 mt-4"></div>
        <p className="text-center text-sm text-white">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign Up
          </a>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <a href="/forgot-password" className="hover:underline text-blue-400">
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
}
