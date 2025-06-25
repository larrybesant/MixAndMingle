"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function StreamHistoryPage() {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("room_history")
        .select(
          "id, room_id, started_at, ended_at, peak_viewers, total_messages, duration_minutes, dj_rooms(name, genre)",
        )
        .eq("dj_rooms.host_id", userData.user.id)
        .order("started_at", { ascending: false });
      setStreams(data || []);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Stream History</h1>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : streams.length === 0 ? (
        <div className="text-gray-400">No past streams yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2">Room</th>
                <th className="p-2">Genre</th>
                <th className="p-2">Started</th>
                <th className="p-2">Ended</th>
                <th className="p-2">Duration</th>
                <th className="p-2">Peak Viewers</th>
                <th className="p-2">Messages</th>
              </tr>
            </thead>
            <tbody>
              {streams.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-gray-700 hover:bg-gray-900"
                >
                  <td className="p-2">{s.dj_rooms?.name || "-"}</td>
                  <td className="p-2">{s.dj_rooms?.genre || "-"}</td>
                  <td className="p-2">
                    {s.started_at
                      ? new Date(s.started_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="p-2">
                    {s.ended_at ? new Date(s.ended_at).toLocaleString() : "-"}
                  </td>
                  <td className="p-2">
                    {s.duration_minutes ? `${s.duration_minutes} min` : "-"}
                  </td>
                  <td className="p-2">{s.peak_viewers ?? "-"}</td>
                  <td className="p-2">{s.total_messages ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
