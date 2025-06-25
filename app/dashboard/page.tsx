"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useFriends, useRecentMessages } from "@/lib/friends-messages-hooks";
import type { Profile } from "@/types/database";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

// Extend Profile for dashboard (temporary until unified in types/database.ts)
type DashboardProfile = Profile & {
  relationship_style?: string | null;
  bdsm_preferences?: string | null;
  show_bdsm_public?: boolean;
  is_dating_visible?: boolean;
  profiles?: { avatar_url?: string | null; username?: string | null };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const router = useRouter();

  const { friends, loading: friendsLoading } = useFriends(user?.id || null);
  const { conversations, loading: messagesLoading } = useRecentMessages(user?.id || null);

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
        .select("id, full_name, username, avatar_url, bio, music_preferences, created_at, gender, relationship_style, bdsm_preferences, show_bdsm_public, is_dating_visible")
        .eq("id", data.user.id)
        .single();
      if (profileData) {
        setProfile({
          id: String(profileData.id),
          full_name: typeof profileData.full_name === "string" ? profileData.full_name : null,
          username: typeof profileData.username === "string" ? profileData.username : null,
          avatar_url: typeof profileData.avatar_url === "string" ? profileData.avatar_url : null,
          bio: typeof profileData.bio === "string" ? profileData.bio : null,
          music_preferences: Array.isArray(profileData.music_preferences)
            ? profileData.music_preferences
            : (typeof profileData.music_preferences === "string"
                ? [profileData.music_preferences]
                : []),
          created_at: String(profileData.created_at),
          gender: typeof profileData.gender === "string" ? profileData.gender : undefined,
          relationship_style: typeof profileData.relationship_style === "string" ? profileData.relationship_style : null,
          bdsm_preferences: typeof profileData.bdsm_preferences === "string" ? profileData.bdsm_preferences : null,
          show_bdsm_public: Boolean(profileData.show_bdsm_public),
          is_dating_visible: Boolean(profileData.is_dating_visible),
        });
      } else {
        setProfile(null);
      }
      // Redirect to onboarding if profile is incomplete
      if (!profileData || !profileData.username || !profileData.bio || !profileData.music_preferences || !profileData.avatar_url) {
        router.replace("/create-profile");
        return;
      }
      setLoading(false);
    }
    getUser();
  }, [router]);

  // Profile completeness logic
  function getProfileCompleteness(profile: DashboardProfile | null) {
    if (!profile) return 0;
    let complete = 0;
    let total = 6; // username, bio, music_preferences, avatar_url, gender, relationship_style
    if (profile.username) complete++;
    if (profile.bio) complete++;
    if (profile.music_preferences && profile.music_preferences.length > 0) complete++;
    if (profile.avatar_url) complete++;
    if (profile.gender) complete++;
    if (profile.relationship_style) complete++;
    return Math.round((complete / total) * 100);
  }
  const completeness = getProfileCompleteness(profile);
  const missingFields = [];
  if (profile) {
    if (!profile.username) missingFields.push("Username");
    if (!profile.bio) missingFields.push("Bio");
    if (!profile.music_preferences || profile.music_preferences.length === 0) missingFields.push("Music Preferences");
    if (!profile.avatar_url) missingFields.push("Avatar");
    if (!profile.gender) missingFields.push("Gender");
    if (!profile.relationship_style) missingFields.push("Relationship Style");
  }

  if (loading) return <div className="text-white p-8 animate-pulse">Loading...</div>;

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2 sm:px-0">
        <header>
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <div className="mb-2">Welcome, {profile?.username || user?.email || "User"}!</div>
          <div className="mb-8 text-gray-400">Your Profile</div>
        </header>
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
            const { error } = await supabase.from("profiles").update({ username: profile.username }).eq("id", user?.id ?? "");
            if (error) {
              setFormMessage("Failed to update profile. Try again.");
            } else {
              setFormMessage("Profile updated!");
            }
          }}
        >
          <label className="text-gray-300" htmlFor="username">Username</label>
          <input
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            id="username"
            value={profile?.username || ""}
            onChange={e => setProfile(profile ? { ...profile, username: e.target.value } : null)}
            required
            aria-required="true"
            aria-label="Username"
          />
          <button className="bg-blue-600 px-4 py-2 rounded font-bold mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400" type="submit">
            Update Profile
          </button>
          {formMessage && <div className="text-sm text-white bg-black/60 rounded p-2 mt-2" aria-live="polite">{formMessage}</div>}
        </form>
        <section className="mb-4 text-center text-lg">
          <span className="font-semibold">Relationship Style:</span> {profile?.relationship_style ? profile.relationship_style.charAt(0).toUpperCase() + profile.relationship_style.slice(1) : "Not set"}
        </section>
        <section className="mb-4 text-center text-sm text-gray-300">
          <span className="font-semibold">Music Preferences:</span> {profile && Array.isArray(profile.music_preferences) ? profile.music_preferences.join(", ") : profile?.music_preferences}
        </section>
        <section className="mb-4 text-center text-sm text-gray-300">
          <span className="font-semibold">Dating/Matchmaking:</span> {profile?.is_dating_visible ? "Opted In" : "Not Listed"}
        </section>
        {profile?.bdsm_preferences && (
          <section className="mb-4 text-center text-sm bg-gray-800/80 p-3 rounded-lg">
            <span className="font-semibold text-purple-300">BDSM / Kink / Other (private):</span> {profile.bdsm_preferences}
            {profile.show_bdsm_public && <span className="ml-2 text-green-400">(Public)</span>}
          </section>
        )}
        <section className="w-full max-w-md mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-300">Profile completeness</span>
            <span className="text-sm font-bold text-white">{completeness}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div className="h-3 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          {completeness < 100 && (
            <div className="text-xs text-yellow-300 mb-2">Complete your profile for the best experience!</div>
          )}
          {missingFields.length > 0 && (
            <div className="text-xs text-red-400 mb-2 flex flex-col gap-1">
              {missingFields.map((field) => (
                <span key={field}>
                  Missing: {field} {field === "Username" ? <a href="#username" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</a> : null}
                  {field === "Bio" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Music Preferences" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Avatar" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Gender" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Relationship Style" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                </span>
              ))}
            </div>
          )}
          {completeness < 100 && (
            <Link href="/create-profile" className="block mt-2 bg-blue-700 text-white px-4 py-2 rounded font-bold text-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Complete Profile</Link>
          )}
        </section>
        <nav className="flex gap-4 mb-8">
          <Link href="/dashboard/history" className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition focus:outline-none focus:ring-2 focus:ring-purple-400">My Stream History</Link>
          <Link href="/settings" className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-gray-400">Settings</Link>
        </nav>
        {/* Friends List Section */}
        <section className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-2">Friends</h2>
          {friendsLoading ? (
            <div className="text-gray-400 italic">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 italic">You have no friends yet.</div>
          ) : (
            <ul className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 divide-y divide-gray-700">
              {friends.map((f: { id: string; avatar_url?: string | null; username?: string | null }) => (
                <li key={f.id} className="flex items-center gap-3 py-2">
                  <Image src={f.avatar_url || "/file.svg"} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full bg-gray-600" />
                  <span>{f.username || "Unknown"}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/friends" className="block mt-2 bg-blue-700 text-white px-4 py-2 rounded font-bold text-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Manage Friends</Link>
        </section>
        {/* Messenger Section */}
        <section className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-2">Messenger</h2>
          {messagesLoading ? (
            <div className="text-gray-400 italic">Loading messages...</div>
          ) : conversations.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 italic">No recent direct messages.</div>
          ) : (
            <ul className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 divide-y divide-gray-700">
              {conversations.map((msg: { id: string; sender?: { avatar_url?: string | null; username?: string | null }; content?: string; message: string }) => (
                <li key={msg.id} className="flex items-center gap-3 py-2">
                  <Image src={msg.sender?.avatar_url || "/file.svg"} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full bg-gray-600" />
                  <span className="font-semibold">{msg.sender?.username || "Unknown"}</span>
                  <span className="mx-2 text-gray-500">→</span>
                  <span>{msg.content ? msg.content.slice(0, 40) : msg.message.slice(0, 40)}{(msg.content ? msg.content.length : msg.message.length) > 40 ? "..." : ""}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/messages" className="block mt-2 bg-blue-700 text-white px-4 py-2 rounded font-bold text-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Open Messenger</Link>
        </section>
        <button
          className="bg-red-600 px-4 py-2 rounded font-bold mt-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Sign out and return to home page"
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
