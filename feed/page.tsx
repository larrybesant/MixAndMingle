"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function FeedPage() {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      const { data } = await supabase
        .from("activity_feed")
        .select("id, type, message, created_at")
        .order("created_at", { ascending: false });
      setFeed(data || []);
      setLoading(false);
    }
    fetchFeed();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-2 sm:px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Activity Feed</h1>
      <ul className="space-y-4 w-full max-w-xs sm:max-w-2xl mx-auto">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : feed.length === 0 ? (
          <div className="text-gray-400">No activity yet.</div>
        ) : (
          feed.map((item) => (
            <li key={item.id} className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">
                {new Date(item.created_at).toLocaleString()}
              </div>
              <div className="text-white font-semibold">{item.type}</div>
              <div className="text-white">{item.message}</div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
