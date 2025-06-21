"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      const { data } = await supabase
        .from("dj_rooms")
        .select("id, name, genre, is_live, viewer_count")
        .eq("is_live", true)
        .order("viewer_count", { ascending: false });
      setRooms(data || []);
      setLoading(false);
    }
    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Live Rooms</h1>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : rooms.length === 0 ? (
        <div className="text-gray-400">No live rooms right now. Be the first to go live!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {rooms.map((room) => (
            <div key={room.id} className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center w-full max-w-xs mx-auto">
              <div className="font-bold text-lg mb-2">{room.name}</div>
              <div className="text-gray-400 text-sm mb-2">Genre: {room.genre}</div>
              <div className="text-green-400 text-xs mb-2">{room.viewer_count} viewers</div>
              <Link href={`/room/${room.id}`} className="text-blue-400 hover:underline">
                Join Room
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
