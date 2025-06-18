import { supabase, sql } from "./connection"
import type { Profile, DJRoom, ChatMessage } from "@/types/database"

export class DatabaseService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

    if (error) {
      console.error("Error updating profile:", error)
      throw error
    }

    return data
  }

  // DJ Room operations
  static async getLiveRooms(): Promise<DJRoom[]> {
    const { data, error } = await supabase
      .from("dj_rooms")
      .select(`
        *,
        profiles:host_id (
          username,
          avatar_url
        )
      `)
      .eq("is_live", true)
      .order("viewer_count", { ascending: false })

    if (error) {
      console.error("Error fetching live rooms:", error)
      return []
    }

    return data || []
  }

  static async createRoom(hostId: string, roomData: Partial<DJRoom>) {
    const { data, error } = await supabase
      .from("dj_rooms")
      .insert({
        ...roomData,
        host_id: hostId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating room:", error)
      throw error
    }

    return data
  }

  static async updateRoomStatus(roomId: string, isLive: boolean) {
    const { data, error } = await supabase
      .from("dj_rooms")
      .update({ is_live: isLive })
      .eq("id", roomId)
      .select()
      .single()

    if (error) {
      console.error("Error updating room status:", error)
      throw error
    }

    return data
  }

  // Chat operations
  static async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching chat messages:", error)
      return []
    }

    return data?.reverse() || []
  }

  static async sendChatMessage(roomId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        room_id: roomId,
        user_id: userId,
        message,
      })
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error("Error sending chat message:", error)
      throw error
    }

    return data
  }

  // Real-time subscriptions
  static subscribeToRoom(roomId: string, onMessage: (message: any) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        onMessage,
      )
      .subscribe()
  }

  static subscribeToRoomUpdates(roomId: string, onUpdate: (update: any) => void) {
    return supabase
      .channel(`room_updates:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dj_rooms",
          filter: `id=eq.${roomId}`,
        },
        onUpdate,
      )
      .subscribe()
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
        FROM dj_rooms r
        LEFT JOIN room_participants rp ON r.id = rp.room_id
        LEFT JOIN chat_messages cm ON r.id = cm.room_id
        WHERE r.id = ${roomId}
        GROUP BY r.id, r.name, r.genre
      `

      return analytics[0] || null
    } catch (error) {
      console.error("Error fetching room analytics:", error)
      return null
    }
  }

  static async getTopDJs(limit = 10) {
    try {
      const topDJs = await sql`
        SELECT 
          p.id,
          p.username,
          p.avatar_url,
          COUNT(DISTINCT r.id) as total_rooms,
          SUM(r.viewer_count) as total_viewers,
          AVG(r.viewer_count) as avg_viewers
        FROM profiles p
        JOIN dj_rooms r ON p.id = r.host_id
        WHERE p.is_dj = true
        GROUP BY p.id, p.username, p.avatar_url
        ORDER BY total_viewers DESC
        LIMIT ${limit}
      `

      return topDJs
    } catch (error) {
      console.error("Error fetching top DJs:", error)
      return []
    }
  }
}
