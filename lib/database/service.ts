import { supabase, sql } from "./connection";
import { ProfileSchema } from "@/lib/zod-schemas-shared";
import type { Profile, UserRoom, ChatMessage } from "@/types/database";

export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Validate with Zod before returning
    const parsed = ProfileSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Invalid profile data:", parsed.error);
      return null;
    }
    return parsed.data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    return data;
  }
  // User Room operations
  static async getLiveRooms(): Promise<UserRoom[]> {
    const { data, error } = await supabase
      .from("user_rooms")
      .select("*")
      .eq("is_live", true)
      .order("viewer_count", { ascending: false });

    if (error) {
      console.error("Error fetching live rooms:", error);
      return [];
    }

    return (data as UserRoom[]) || [];
  }

  static async createRoom(hostId: string, roomData: Partial<UserRoom>) {
    const { data, error } = await supabase
      .from("user_rooms")
      .insert({
        ...roomData,
        host_id: hostId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating room:", error);
      throw error;
    }

    return data;
  }

  static async updateRoomStatus(roomId: string, isLive: boolean) {
    const { data, error } = await supabase
      .from("user_rooms")
      .update({ is_live: isLive })
      .eq("id", roomId)
      .select()
      .single();

    if (error) {
      console.error("Error updating room status:", error);
      throw error;
    }

    return data;
  }
  // Chat operations
  static async getChatMessages(
    roomId: string,
    limit = 50,
  ): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }

    return (data as ChatMessage[])?.reverse() || [];
  }
  static async sendChatMessage(
    roomId: string,
    userId: string,
    message: string,
  ) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        user_id: userId,
        message,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }

    return data;
  }
  // Real-time subscriptions
  static subscribeToRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void,
  ) {
    return supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: { new: ChatMessage }) =>
          onMessage(payload.new as ChatMessage),
      )
      .subscribe();
  }

  static subscribeToRoomUpdates(
    roomId: string,
    onUpdate: (update: UserRoom) => void,
  ) {
    return supabase
      .channel(`room_updates:${roomId}`)
      .on(
        "postgres_changes" as any,
        {
          event: "UPDATE",
          schema: "public",
          table: "user_rooms",
          filter: `id=eq.${roomId}`,
        },
        (payload: { new: UserRoom }) => onUpdate(payload.new as UserRoom),
      )
      .subscribe();
  }

  // Analytics using Neon for complex queries
  static async getRoomAnalytics(roomId: string) {
    try {
      const analytics = await sql`
        SELECT 
          r.name,
          r.genre,
          COUNT(DISTINCT rp.user_id) as unique_visitors,
          COUNT(cm.id) as total_messages,
          AVG(r.viewer_count) as avg_viewers,
          MAX(r.viewer_count) as peak_viewers
        FROM user_rooms r
        LEFT JOIN room_participants rp ON r.id = rp.room_id
        LEFT JOIN chat_messages cm ON r.id = cm.room_id
        WHERE r.id = ${roomId}
        GROUP BY r.id, r.name, r.genre
      `;

      return analytics[0] || null;
    } catch (error) {
      console.error("Error fetching room analytics:", error);
      return null;
    }
  }

  static async getTopUsers(limit = 10) {
    try {
      const topUsers = await sql`
        SELECT 
          p.id,
          p.username,
          p.avatar_url,
          COUNT(DISTINCT r.id) as total_rooms,
          SUM(r.viewer_count) as total_viewers,
          AVG(r.viewer_count) as avg_viewers
        FROM profiles p
        JOIN user_rooms r ON p.id = r.host_id
        WHERE p.is_creator = true
        GROUP BY p.id, p.username, p.avatar_url
        ORDER BY total_viewers DESC
        LIMIT ${limit}
      `;

      return topUsers;
    } catch (error) {
      console.error("Error fetching top users:", error);
      return [];
    }
  }
}
