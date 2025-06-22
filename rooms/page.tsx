"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { UserRoomListSchema } from "@/lib/zod-schemas";
import type { UserRoom } from "@/types/database";
import dynamic from "next/dynamic";

const RoomCard = dynamic(
  () => import("@/components/room/RoomCard").then((mod) => mod.RoomCard),
  {
    loading: () => <div className="text-gray-400">Loading room...</div>,
    ssr: false,
  },
);

export default function RoomsPage() {
  const [rooms, setRooms] = useState<UserRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data, error } = await supabase
          .from("dj_rooms")
          .select(
            "id, name, genre, is_live, viewer_count, description, host_id, tags, created_at",
          )
          .eq("is_live", true)
          .order("viewer_count", { ascending: false });
        if (error) throw error;
        const parsed = UserRoomListSchema.safeParse(data || []);
        if (!parsed.success) {
          setError("Invalid data received from server. Please try again later.");
          setRooms([]);
          return;
        }
        setRooms(
          parsed.data.map((room) => ({
            ...room,
            // Zod already ensures types, but tags may be null from DB
            tags: Array.isArray(room.tags) ? room.tags : [],
          })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch rooms.");
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Live Rooms</h1>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : rooms.length === 0 ? (
        <div className="text-gray-400">
          No live rooms right now. Be the first to go live!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <Suspense
            fallback={
              <div className="text-gray-400">Loading rooms...</div>
            }
          >
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </Suspense>
        </div>
      )}
    </main>
  );
}

// RoomCard is now lazy loaded for performance with large room lists.
