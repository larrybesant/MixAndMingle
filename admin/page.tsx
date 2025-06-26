"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const ADMIN_EMAIL = "larrybesant@gmail.com"; // Admin email

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      setLoading(false);
    }
    getUser();
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, username, bio, music_preferences, avatar_url");
      const { data: roomsData } = await supabase
        .from("dj_rooms")
        .select("id, name, is_live, host_id, viewer_count");
      setUsers(usersData || []);
      setRooms(roomsData || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="mb-2">Welcome, {user?.email} (Admin)!</div>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="bg-gray-800 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <span className="font-semibold text-white">{user.username}</span>
              <span className="text-xs text-gray-400">{user.bio}</span>
              <span className="text-xs text-purple-400">
                {user.music_preferences?.join(", ")}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Live Rooms</h2>
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="bg-gray-800 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <span className="font-semibold text-white">{room.name}</span>
              <span className="text-xs text-green-400">
                {room.is_live ? "LIVE" : "Offline"}
              </span>
              <span className="text-xs text-gray-400">Host: {room.host_id}</span>
              <span className="text-xs text-blue-400">
                Viewers: {room.viewer_count}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
