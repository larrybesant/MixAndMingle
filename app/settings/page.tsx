"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleUpdateEmail(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.updateUser({ email });
    setMessage(
      error ? error.message : "Email updated! Check your inbox to confirm.",
    );
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : "Password updated!");
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    setMessage("");
    // This will sign out and delete the user from auth, but you may want to add a confirmation step
    const { error } = await supabase.rpc("delete_user");
    if (error) setMessage(error.message);
    else {
      setMessage("Account deleted.");
      await supabase.auth.signOut();
      window.location.href = "/";
    }
    setDeleting(false);
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <form
        onSubmit={handleUpdateEmail}
        className="mb-6 w-full max-w-sm flex flex-col gap-2"
      >
        <label className="text-gray-300">Update Email</label>
        <input
          className="p-2 rounded bg-gray-700 text-white"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="New email"
          required
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded font-bold"
          type="submit"
        >
          Update Email
        </button>
      </form>
      <form
        onSubmit={handleUpdatePassword}
        className="mb-6 w-full max-w-sm flex flex-col gap-2"
      >
        <label className="text-gray-300">Update Password</label>
        <input
          className="p-2 rounded bg-gray-700 text-white"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          required
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded font-bold"
          type="submit"
        >
          Update Password
        </button>
      </form>
      <div className="mb-6 w-full max-w-sm flex flex-col gap-2">
        <label className="text-gray-300">Delete Account</label>
        <button
          className="bg-red-700 px-4 py-2 rounded font-bold"
          onClick={handleDeleteAccount}
          disabled={deleting}
        >
          Delete My Account
        </button>
      </div>
      {message && <div className="text-sm text-yellow-300 mt-2">{message}</div>}
    </main>
  );
}
