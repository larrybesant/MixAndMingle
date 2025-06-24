"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from '@/contexts/auth-context';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
    }
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center space-x-4 mb-6">
        <img src={user?.user_metadata?.avatar_url || '/logo.png'} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-purple-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">{profile?.full_name || user?.email}</h2>
          <p className="text-gray-400">{profile?.bio || 'No bio yet.'}</p>
        </div>
      </div>
      <div className="bg-black/80 border border-purple-700 rounded-xl p-6 shadow-md">
        <h3 className="font-bold text-lg mb-2 text-purple-300">Profile Details</h3>
        <p className="text-gray-300 mb-2"><span className="font-semibold">Email:</span> {user?.email}</p>
        <p className="text-gray-300 mb-2"><span className="font-semibold">Username:</span> {profile?.username || 'Not set'}</p>
        <p className="text-gray-300 mb-2"><span className="font-semibold">Location:</span> {profile?.location || 'Not set'}</p>
        <p className="text-gray-300 mb-2"><span className="font-semibold">Music Preferences:</span> {profile?.music_preferences?.join(', ') || 'Not set'}</p>
        {/* Add edit form or link here as needed */}
      </div>
    </main>
  );
}
