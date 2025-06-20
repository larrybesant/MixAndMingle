"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);
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
      setProfile(profileData);
      // Redirect to onboarding if profile is incomplete
      if (!profileData || !profileData.username || !profileData.bio || !profileData.music_preferences || !profileData.avatar_url) {
        router.replace("/create-profile");
        return;
      }
      setLoading(false);
    }
    getUser();
  }, [router]);

  if (loading) return <div className="text-white p-8 animate-pulse">Loading...</div>;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2 sm:px-0">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <div className="mb-2">Welcome, {profile?.username || user.email}!</div>
        <div className="mb-8 text-gray-400">Your Profile</div>
        {/* Profile Editing Form */}
        <form
          className="flex flex-col gap-2 mb-6 w-full max-w-xs sm:max-w-md"
          onSubmit={async (e) => {
            e.preventDefault();
            setFormMessage(null);
            if (!profile?.username) {
              setFormMessage("Username is required.");
              return;
            }
            const { error } = await supabase.from("profiles").update({ username: profile.username }).eq("id", user.id);
            if (error) {
              setFormMessage("Failed to update profile. Try again.");
            } else {
              setFormMessage("Profile updated!");
            }
          }}
        >
          <label className="text-gray-300">Username</label>
          <input
            className="p-2 rounded bg-gray-700 text-white"
            type="text"
            value={profile?.username || ""}
            onChange={e => setProfile({ ...profile, username: e.target.value })}
            required
          />
          <button className="bg-blue-600 px-4 py-2 rounded font-bold mt-2" type="submit">
            Update Profile
          </button>
          {formMessage && <div className="text-sm text-white bg-black/60 rounded p-2 mt-2">{formMessage}</div>}
        </form>
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
    </ErrorBoundary>
  );
}
