"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  useEffect(() => {
    // Pre-fill email if provided in URL
    const emailParam = searchParams?.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        if (resetError.message.includes("User not found")) {
          setError("No account found with this email address");
        } else if (
          resetError.message.includes("405") ||
          resetError.message.includes("hook")
        ) {
          setError(
            "There's a temporary issue with password reset. Please contact support at support@mixandmingle.com or try again later.",
          );
        } else if (resetError.message.includes("too many requests")) {
          setError(
            "Too many reset attempts. Please wait a few minutes before trying again.",
          );
        } else {
          setError(resetError.message);
        }
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(
        "An unexpected error occurred. Please try again or contact support.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
        <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Check Your Email
              </h2>
              <p className="text-gray-400">
                We&apos;ve sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in the email to reset your password. The link
                will expire in 1 hour.
              </p>
              <div className="space-y-2 pt-4">
                <p className="text-xs text-gray-500">
                  Didn&apos;t receive the email?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="text-purple-400 border-purple-400 hover:bg-purple-400/10"
                >
                  Try a different email
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {" "}
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {error.includes("405") ||
                error.includes("hook") ||
                error.includes("support@") ? (
                  <div className="mt-2 pt-2 border-t border-red-700/50">
                    <p className="text-sm text-red-300">
                      <strong>Quick Fix:</strong> This is a known issue that can
                      be resolved.
                      <br />• Try refreshing the page and attempting again
                      <br />• Contact us at{" "}
                      <a
                        href="mailto:support@mixandmingle.com"
                        className="underline"
                      >
                        support@mixandmingle.com
                      </a>
                      <br />• Or try signing in with your current password
                    </p>
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
          {/* Additional Options */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-500">Remember your password?</p>
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 text-sm underline"
            >
              Back to Sign In
            </Link>
          </div>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-gray-400 text-center w-full">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
