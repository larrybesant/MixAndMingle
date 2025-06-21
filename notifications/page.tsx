"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("id, type, message, created_at, read")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    }
    fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-2 sm:px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Notifications</h1>
      <ul className="space-y-4 w-full max-w-xs sm:max-w-2xl mx-auto">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-400">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <li key={n.id} className={`bg-gray-800 rounded-xl p-4 ${n.read ? '' : 'border-l-4 border-blue-500'}`}>
              <div className="text-xs text-gray-400 mb-1">{new Date(n.created_at).toLocaleString()}</div>
              <div className="text-white font-semibold">{n.type}</div>
              <div className="text-white">{n.message}</div>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
