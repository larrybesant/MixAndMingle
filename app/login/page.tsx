"use client"

<<<<<<< HEAD
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900 p-8 rounded-xl shadow-xl w-full max-w-xs" autoComplete="off">
        <h1 className="text-2xl font-bold mb-4 text-center">Sign In</h1>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          className="w-full p-3 rounded bg-black/40 text-white placeholder-white/80 border border-gray-700 mb-2"
          aria-label="Email"
          required
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          className="w-full p-3 rounded bg-black/40 text-white placeholder-white/80 border border-gray-700 mb-2"
          aria-label="Password"
          required
        />
        {error && <div role="alert" className="text-red-500 bg-red-900/20 border border-red-500/30 p-2 rounded text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 disabled:opacity-50 font-bold"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
=======
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to demo login page
    router.replace("/demo-login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="text-white text-xl">Redirecting to demo login...</div>
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
    </div>
  )
}
