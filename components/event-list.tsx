"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function EventList() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      const { data } = await supabase
        .from("rooms")
        .select("id, name, genre, is_live, created_at")
        .order("created_at", { ascending: false });
      setRooms(data || []);
      setLoading(false);
    }
    fetchRooms();
  }, []);

  if (loading) return <div className="text-white">Loading events...</div>;

  return (
    <div className="bg-black/60 rounded-xl p-4 mt-8 w-full max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4 text-white">
        Upcoming Rooms & Events
      </h2>
      {rooms.length === 0 ? (
        <div className="text-gray-400">No upcoming rooms or events.</div>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="bg-gray-800 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <span className="font-semibold text-white">{room.name}</span>
                <span className="ml-2 text-xs text-purple-400">
                  {room.genre}
                </span>
                {room.is_live && (
                  <span className="ml-2 text-green-400 font-bold">LIVE</span>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(room.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
