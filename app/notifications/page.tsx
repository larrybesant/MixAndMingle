"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { NotificationListSchema } from "@/lib/zod-schemas-shared";

type Notification = {
  id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await supabase
          .from("notifications")
          .select("id, type, message, created_at, read")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        const parsed = NotificationListSchema.safeParse(data || []);
        setNotifications(parsed.success ? parsed.data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white px-2 sm:px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Notifications</h1>
      <ul className="space-y-4 w-full max-w-xs sm:max-w-2xl mx-auto">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
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
// TODO: Modularize notification list and add E2E tests.
