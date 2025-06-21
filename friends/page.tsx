"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndFriends() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setUser(userData.user);
      // Fetch accepted friends
      const { data: friendsData } = await supabase
        .from("friends")
        .select("*, profiles:friend_id(username, avatar_url)")
        .or(`user_id.eq.${userData.user.id},friend_id.eq.${userData.user.id}`)
        .eq("status", "accepted");
      setFriends(friendsData || []);
      // Fetch pending requests
      const { data: requestsData } = await supabase
        .from("friends")
        .select("*, profiles:user_id(username, avatar_url)")
        .eq("friend_id", userData.user.id)
        .eq("status", "pending");
      setRequests(requestsData || []);
      setLoading(false);
    }
    fetchUserAndFriends();
  }, []);

  async function acceptRequest(id: string) {
    await supabase.from("friends").update({ status: "accepted" }).eq("id", id);
    setRequests(requests => requests.filter(r => r.id !== id));
    // Optionally refetch friends
  }

  async function removeFriend(id: string) {
    await supabase.from("friends").delete().eq("id", id);
    setFriends(friends => friends.filter(f => f.id !== id));
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-2 py-8">
      <h1 className="text-3xl font-bold mb-6">Friends</h1>
      {loading ? <div className="text-gray-400">Loading...</div> : (
        <>
          <section className="w-full max-w-md mb-8">
            <h2 className="text-xl font-bold mb-2">Pending Requests</h2>
            {requests.length === 0 ? <div className="text-gray-400 italic">No pending requests.</div> : (
              <ul className="bg-gray-800 rounded-lg p-4 divide-y divide-gray-700">
                {requests.map(r => (
                  <li key={r.id} className="flex items-center gap-3 py-2">
                    <img src={r.profiles?.avatar_url || "/file.svg"} alt="avatar" className="w-8 h-8 rounded-full bg-gray-600" />
                    <span>{r.profiles?.username || "Unknown"}</span>
                    <button className="ml-auto bg-blue-600 px-3 py-1 rounded font-bold" onClick={() => acceptRequest(r.id)}>Accept</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="w-full max-w-md mb-8">
            <h2 className="text-xl font-bold mb-2">Your Friends</h2>
            {friends.length === 0 ? <div className="text-gray-400 italic">No friends yet.</div> : (
              <ul className="bg-gray-800 rounded-lg p-4 divide-y divide-gray-700">
                {friends.map(f => (
                  <li key={f.id} className="flex items-center gap-3 py-2">
                    <img src={f.profiles?.avatar_url || "/file.svg"} alt="avatar" className="w-8 h-8 rounded-full bg-gray-600" />
                    <span>{f.profiles?.username || "Unknown"}</span>
                    <button className="ml-auto bg-red-600 px-3 py-1 rounded font-bold" onClick={() => removeFriend(f.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
