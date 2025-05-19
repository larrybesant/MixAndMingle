export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          event_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          event_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          event_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          event_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      direct_messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
          attachment_url: string | null
          attachment_type: string | null
          is_voice_message: boolean
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          content: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
          attachment_url?: string | null
          attachment_type?: string | null
          is_voice_message?: boolean
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
          attachment_url?: string | null
          attachment_type?: string | null
          is_voice_message?: boolean
        }
      }
      // Add additional tables as needed based on your schema
      dj_profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          experience: string | null
          genres: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          experience?: string | null
          genres?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          experience?: string | null
          genres?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          amount: number
          currency: string
          status: string
          created_at: string
          payment_intent_id: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          amount: number
          currency?: string
          status?: string
          created_at?: string
          payment_intent_id?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          amount?: number
          currency?: string
          status?: string
          created_at?: string
          payment_intent_id?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          status: string
          created_at: string
          converted_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          status?: string
          created_at?: string
          converted_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          status?: string
          created_at?: string
          converted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
