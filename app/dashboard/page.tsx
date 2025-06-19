"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      setProfile(profileData as Profile); // Ensure correct type
      setLoading(false);
    }
    getUser();
  }, [router]);

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
      {profile && user && (
        <>
          <div className="mb-2">Welcome, {profile.username || user.email}!</div>
          <div className="mb-8 text-gray-400">Your Profile</div>
          {/* Profile Editing Form */}
          <form
            className="flex flex-col gap-2 mb-6"
            onSubmit={async (e) => {
              e.preventDefault();
              await supabase.from("profiles").update({ username: profile.username }).eq("id", user.id);
              alert("Profile updated!");
            }}
          >
            <label className="text-gray-300">Username</label>
            <input
              className="p-2 rounded bg-gray-700 text-white"
              type="text"
              value={profile.username || ""}
              onChange={e => setProfile({ ...profile, username: e.target.value } as Profile)}
              required
            />
            <button className="bg-blue-600 px-4 py-2 rounded font-bold mt-2" type="submit">
              Update Profile
            </button>
          </form>
        </>
      )}
      <button
        className="bg-red-600 px-4 py-2 rounded font-bold mt-4"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/";
        }}
      >
        Sign Out
      </button>
    </main>
  );
}
