import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile, ChatMessage } from '@/types/database';

export function useFriends(userId: string | null) {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function fetchFriends() {
      setLoading(true);      // Fetch accepted friends where user is either user_id or friend_id
      const { error } = await supabase
        .from("friends")
        .select("*")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");
      if (isMounted) {
        // For now, just set empty array until we have proper friend profile data
        setFriends([]);
        setLoading(false);
      }
    }
    fetchFriends();
    return () => { isMounted = false; };
  }, [userId]);

  return { friends, loading };
}

export function useRecentMessages(userId: string | null) {
  const [conversations, setConversations] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;
    async function fetchConversations() {
      setLoading(true);      // Fetch recent messages where user is sender or receiver
      const { error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(10);
      if (isMounted) {
        // For now, set empty array until we have proper message structure
        setConversations([]);
        setLoading(false);
      }
    }
    fetchConversations();
    return () => { isMounted = false; };
  }, [userId]);

  return { conversations, loading };
}
