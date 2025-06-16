"use client";

import { useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Sign In</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
        <input
          className="p-3 rounded bg-gray-800"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="p-3 rounded bg-gray-800"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          className="bg-purple-600 py-3 rounded font-bold hover:bg-purple-700"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-yellow-400">{message}</div>}
      <Link href="/signup" className="mt-4 text-purple-400 hover:underline">
        Don't have an account? Sign Up
      </Link>
    </main>
  );
}
