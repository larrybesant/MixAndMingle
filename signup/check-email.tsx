"use client";

import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black px-4">
      <div className="w-full max-w-md bg-black/80 border border-purple-500/30 backdrop-blur-sm rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent mb-4">
          Check Your Email
        </h1>
        <p className="text-gray-300 mb-6">
          We’ve sent a verification link to your email address. Please check
          your inbox (and spam folder) to verify your account before signing in.
        </p>
        <Link
          href="/login"
          className="text-blue-400 hover:underline font-semibold"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
