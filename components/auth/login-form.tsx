"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, Github, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, signInWithOAuth, error, clearError } = useAuth();
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear general error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const { error: signInError } = await signIn(
        formData.email,
        formData.password,
      );

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          setErrors({
            general:
              "Invalid email or password. Please check your credentials.",
          });
        } else if (signInError.message.includes("Email not confirmed")) {
          setErrors({
            general:
              "Please verify your email before logging in. Check your inbox for a verification link.",
          });
        } else if (signInError.message.includes("User not found")) {
          setErrors({
            general: "No account found with this email. Please sign up first.",
          });
        } else {
          setErrors({ general: signInError.message });
        }
      } else {
        // Successful login - redirect will be handled by the auth context
        router.push("/dashboard");
      }
    } catch (err) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    clearError();

    try {
      const { error: oauthError } = await signInWithOAuth(provider);

      if (oauthError) {
        setErrors({
          general: `${provider} sign in failed: ${oauthError.message}`,
        });
      }
      // Success will redirect automatically via OAuth flow
    } catch (err) {
      setErrors({ general: `${provider} sign in failed. Please try again.` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (formData.email && validateEmail(formData.email)) {
      router.push(
        `/auth/forgot-password?email=${encodeURIComponent(formData.email)}`,
      );
    } else {
      router.push("/auth/forgot-password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <Card className="w-full max-w-md bg-black/80 border-purple-500/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to your Mix & Mingle account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* OAuth Buttons */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-black border-gray-300"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FcGoogle className="mr-2 h-4 w-4" />
              )}
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white border-gray-600"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-black px-2 text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Error Alert */}
          {(error || errors.general) && (
            <Alert variant="destructive">
              <AlertDescription>
                {errors.general || error}
                {errors.general?.includes("verify your email") && (
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/auth/resend-verification")}
                      className="text-xs"
                    >
                      Resend verification email
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                  aria-invalid={!!errors.email}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10 bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-white"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-900 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-purple-400 hover:text-purple-300 underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-gray-400 text-center w-full">
            Don't have an account?{" "}
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
