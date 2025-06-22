"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FriendListSchema, FriendRequestListSchema } from "@/lib/zod-schemas-shared";

type FriendProfile = {
  username: string | null;
  avatar_url: string | null;
};
type Friend = {
  id: string;
  profiles: FriendProfile;
};
type FriendRequest = {
  id: string;
  profiles: FriendProfile;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndFriends() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) return;
        const { data: friendsData, error: friendsError } = await supabase
          .from("friends")
          .select("id, profiles:friend_id(username, avatar_url)")
          .or(`user_id.eq.${userData.user.id},friend_id.eq.${userData.user.id}`)
          .eq("status", "accepted");
        if (friendsError) throw friendsError;
        const parsedFriends = FriendListSchema.safeParse(friendsData || []);
        setFriends(parsedFriends.success ? parsedFriends.data : []);
        const { data: requestsData, error: reqError } = await supabase
          .from("friends")
          .select("id, profiles:user_id(username, avatar_url)")
          .eq("friend_id", userData.user.id)
          .eq("status", "pending");
        if (reqError) throw reqError;
        const parsedRequests = FriendRequestListSchema.safeParse(requestsData || []);
        setRequests(parsedRequests.success ? parsedRequests.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch friends.");
      } finally {
        setLoading(false);
      }
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
      {loading ? <div className="text-gray-400">Loading...</div> : error ? <div className="text-red-400">{error}</div> : (
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
// TODO: Modularize friend/request list and add E2E tests.
