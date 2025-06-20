import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function useFriends(userId: string | null) {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function fetchFriends() {
      setLoading(true);
      // Fetch accepted friends where user is either user_id or friend_id
      const { data, error } = await supabase
        .from("friends")
        .select("*, profiles:friend_id(username, avatar_url)")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      if (isMounted) {
        setFriends(data || []);
        setLoading(false);
      }
    }
    fetchFriends();
    return () => { isMounted = false; };
  }, [userId]);

  return { friends, loading };
}

export function useRecentMessages(userId: string | null) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function fetchConversations() {
      setLoading(true);
      // Fetch recent messages where user is sender or receiver
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:sender_id(username, avatar_url), receiver:receiver_id(username, avatar_url)")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (isMounted) {
        setConversations(data || []);
        setLoading(false);
      }
    }
    fetchConversations();
    return () => { isMounted = false; };
  }, [userId]);

  return { conversations, loading };
}
