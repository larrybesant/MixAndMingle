"use client";

import { useState } from "react";
import Link from "next/link";
import supabase from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    // Save profile
    if (data.user) {
      await supabase.from("profiles").insert([
        { id: data.user.id, username }
      ]);
    }
    setLoading(false);
    setMessage("Check your email to confirm your signup!");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-4 w-80">
        <input
          className="p-3 rounded bg-gray-800"
          type="text"
          placeholder="DJ Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
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
          className="bg-pink-600 py-3 rounded font-bold hover:bg-pink-700"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      {message && <div className="mt-4 text-center text-sm text-yellow-400">{message}</div>}
      <Link href="/login" className="mt-4 text-pink-400 hover:underline">
        Already have an account? Sign In
      </Link>
    </main>
  );
}
