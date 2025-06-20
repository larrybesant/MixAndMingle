"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

export default function DiscoverPage() {
  const [genreFilter, setGenreFilter] = useState("");
  const [privacyFilter, setPrivacyFilter] = useState("");
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  // Helper: check if user is a DJ (for Go Live button)
  const [isDJ, setIsDJ] = useState(false);

  useEffect(() => {
    async function fetchRooms() {
      let query = supabase
        .from("dj_rooms")
        .select("id, name, genre, host_id, is_live, viewer_count, stream_url, tags, created_at, room_settings:room_settings(privacy), host:profiles(username, avatar_url)")
        .eq("is_live", true);
      if (genreFilter) query = query.eq("genre", genreFilter);
      if (privacyFilter) query = query.eq("room_settings.privacy", privacyFilter);
      if (search) query = query.ilike("name", `%${search}%`);
      const { data } = await query;
      setRooms(data || []);
    }
    fetchRooms();
  }, [genreFilter, privacyFilter, search])

  useEffect(() => {
    async function checkDJ() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('is_dj').eq('id', data.user.id).single();
        setIsDJ(!!profile?.is_dj);
      }
    }
    checkDJ();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Browse Live Rooms</h1>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <label className="text-white">Genre:</label>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={genreFilter}
          onChange={e => setGenreFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="house">House</option>
          <option value="techno">Techno</option>
          <option value="hiphop">Hip-Hop</option>
          <option value="pop">Pop</option>
          <option value="edm">EDM</option>
          <option value="other">Other</option>
        </select>
        <label className="text-white ml-4">Privacy:</label>
        <select
          className="p-2 rounded bg-gray-700 text-white"
          value={privacyFilter}
          onChange={e => setPrivacyFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="public">Public</option>
          <option value="followers">Followers Only</option>
          <option value="invite">Invite Only</option>
        </select>
        <input
          className="ml-4 p-2 rounded bg-gray-700 text-white"
          placeholder="Search by room name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      {rooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="text-6xl mb-4">🎧</span>
          <div className="text-gray-400 text-lg mb-4">No live rooms right now. Be the first to go live or invite your friends!</div>
          {isDJ ? (
            <Link href="/go-live" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">Go Live</Link>
          ) : (
            <Link href="/invite" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">Invite Friends</Link>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room.id} className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center transition hover:scale-105 hover:shadow-2xl focus-within:scale-105 focus-within:shadow-2xl">
            <img src={room.host?.avatar_url || "/favicon.ico"} alt={room.host?.username || "Host"} className="h-16 w-16 rounded-full mb-2 border-2 border-purple-500" />
            <div className="font-bold text-lg mb-1 text-center">{room.name}</div>
            <div className="text-gray-400 text-sm mb-1">Host: {room.host?.username || "Unknown"}</div>
            <div className="text-gray-400 text-sm mb-1">Genre: {room.genre || "-"}</div>
            <div className="text-gray-400 text-sm mb-1">Viewers: {room.viewer_count ?? 0}</div>
            <div className="text-gray-400 text-xs mb-2">Privacy: {room.room_settings?.privacy || "public"}</div>
            <Link href={`/room/${room.id}`} className="text-blue-400 hover:underline font-semibold mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded">Join Room</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
