"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EventList from "@/components/event-list";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
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
              setUpdating(true);
              setUpdateStatus(null);
              const { error } = await supabase.from("profiles").update({ 
                username: profile.username, 
                bio: profile.bio, 
                music_preferences: profile.music_preferences, 
                avatar_url: profile.avatar_url
              }).eq("id", user.id);
              setUpdating(false);
              if (error) {
                setUpdateStatus("Error updating profile. Please try again.");
              } else {
                setUpdateStatus("Profile updated successfully!");
                setTimeout(() => router.replace("/dashboard"), 1200);
              }
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
            <label className="text-gray-300 mt-2">Bio</label>
            <textarea
              className="p-2 rounded bg-gray-700 text-white min-h-[60px]"
              value={profile.bio || ""}
              onChange={e => setProfile({ ...profile, bio: e.target.value } as Profile)}
              maxLength={200}
              placeholder="Tell us about yourself..."
            />
            <label className="text-gray-300 mt-2">Favorite Genres</label>
            <select
              className="p-2 rounded bg-gray-700 text-white"
              multiple
              value={profile.music_preferences || []}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setProfile({ ...profile, music_preferences: options } as Profile);
              }}
            >
              <option value="Pop">Pop</option>
              <option value="Hip-Hop">Hip-Hop</option>
              <option value="Electronic">Electronic</option>
              <option value="Rock">Rock</option>
              <option value="R&B">R&B</option>
              <option value="Jazz">Jazz</option>
              <option value="Country">Country</option>
              <option value="Classical">Classical</option>
              <option value="Reggae">Reggae</option>
              <option value="Other">Other</option>
            </select>
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-4">
              <Avatar className="h-20 w-20 mb-2">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || user.email || "Avatar"} />
                <AvatarFallback>{(profile.username || user.email || "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                className="text-white"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  const fileExt = file.name.split('.').pop();
                  const filePath = `avatars/${user.id}.${fileExt}`;
                  const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
                  if (!uploadError) {
                    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
                    setProfile({ ...profile, avatar_url: data.publicUrl } as Profile);
                    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id);
                  }
                }}
              />
            </div>
            <button className="bg-blue-600 px-4 py-2 rounded font-bold mt-2" type="submit" disabled={updating}>
              {updating ? "Updating..." : "Update Profile"}
            </button>
            {updateStatus && (
              <div className={`mt-2 text-center ${updateStatus.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{updateStatus}</div>
            )}
          </form>
          <hr className="my-8 border-white/10" />
          {/* Event/Room List */}
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-lg">
              <EventList />
            </div>
          </div>
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
