"use client";

export const dynamic = "force-dynamic";

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
  // Communities schema setup states
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaMessage, setSchemaMessage] = useState("");
  const [schemaError, setSchemaError] = useState("");
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

  const setupCommunitiesSchema = async () => {
    try {
      setSchemaLoading(true);
      setSchemaError("");
      setSchemaMessage("");

      const response = await fetch('/api/admin/setup-communities-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSchemaMessage(data.message || "Communities schema setup completed successfully!");
      } else {
        setSchemaError(data.error || "Failed to setup communities schema");
      }
    } catch (err: any) {
      setSchemaError(err.message || "Network error occurred");
    } finally {
      setSchemaLoading(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="mb-8">Welcome, {user?.email} (Admin)!</div>
      
      {/* Communities Schema Setup Section */}
      <section className="mb-8 bg-gray-900 rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Communities Database Setup</h2>
        <p className="text-gray-400 mb-4">
          Set up the database schema for the communities feature.
        </p>

        {schemaMessage && (
          <div className="bg-green-600/20 border border-green-600/30 text-green-300 px-4 py-3 rounded-lg mb-4">
            {schemaMessage}
          </div>
        )}

        {schemaError && (
          <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded-lg mb-4">
            {schemaError}
          </div>
        )}

        <button
          onClick={setupCommunitiesSchema}
          disabled={schemaLoading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
        >
          {schemaLoading ? (
            <>
              <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
              Setting up schema...
            </>
          ) : (
            'Setup Communities Schema'
          )}
        </button>
      </section>

      {/* Existing content */}
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
