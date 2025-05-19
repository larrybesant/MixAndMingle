export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          name: string | null
          description: string | null
          id: number
          created_at: string | null
        }
        Insert: {
          name?: string | null
          description?: string | null
          id?: number
          created_at?: string | null
        }
        Update: {
          name?: string | null
          description?: string | null
          id?: number
          created_at?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string | null
          content: string | null
          sender_id: string | null
          room_id: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          content?: string | null
          sender_id?: string | null
          room_id?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          content?: string | null
          sender_id?: string | null
          room_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          event_id: string | null
          name: string | null
          updated_at: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          event_id?: string | null
          name?: string | null
          updated_at?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          event_id?: string | null
          name?: string | null
          updated_at?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string | null
          updated_at: string | null
          event_id: string | null
          id: string
          content: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          updated_at?: string | null
          event_id?: string | null
          id?: string
          content?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          updated_at?: string | null
          event_id?: string | null
          id?: string
          content?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          created_at: string | null
          is_read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          id: string
          content: string | null
          attachment_url: string | null
          attachment_type: string | null
          is_voice_message: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          id?: string
          content?: string | null
          attachment_url?: string | null
          attachment_type?: string | null
          is_voice_message?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          is_read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          id?: string
          content?: string | null
          attachment_url?: string | null
          attachment_type?: string | null
          is_voice_message?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "direct_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dj_profiles: {
        Row: {
          artist_name: string | null
          bio: string | null
          created_at: string | null
          experience_years: number | null
          genre: string[] | null
          hourly_rate: number | null
          id: string
          portfolio_links: string[] | null
          updated_at: string | null
        }
        Insert: {
          artist_name?: string | null
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          genre?: string[] | null
          hourly_rate?: number | null
          id: string
          portfolio_links?: string[] | null
          updated_at?: string | null
        }
        Update: {
          artist_name?: string | null
          bio?: string | null
          created_at?: string | null
          experience_years?: number | null
          genre?: string[] | null
          hourly_rate?: number | null
          id?: string
          portfolio_links?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dj_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          creator_id: string | null
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          start_time: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          start_time?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          start_time?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          actual_start: string | null
          created_at: string | null
          description: string | null
          dj_id: string | null
          ended_at: string | null
          event_id: string | null
          id: string
          is_public: boolean | null
          scheduled_start: string | null
          status: string | null
          stream_key: string | null
          thumbnail_url: string | null
          title: string | null
          viewer_count: number | null
        }
        Insert: {
          actual_start?: string | null
          created_at?: string | null
          description?: string | null
          dj_id?: string | null
          ended_at?: string | null
          event_id?: string | null
          id?: string
          is_public?: boolean | null
          scheduled_start?: string | null
          status?: string | null
          stream_key: string | null
          thumbnail_url?: string | null
          title?: string | null
          viewer_count?: number | null
        }
        Update: {
          actual_start?: string | null
          created_at?: string | null
          description?: string | null
          dj_id?: string | null
          ended_at?: string | null
          event_id?: string | null
          id?: string
          is_public?: boolean | null
          scheduled_start?: string | null
          status?: string | null
          stream_key?: string | null
          thumbnail_url?: string | null
          title?: string | null
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_dj_id_fkey"
            columns: ["dj_id"]
            referencedRelation: "dj_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_streams_event_id_fkey"
            columns: ["event_id"]
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          created_at: string | null
          updated_at: string | null
          email: string | null
          is_dj: boolean
          is_beta_tester: boolean
          beta_joined_at: string | null
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
          is_dj?: boolean
          is_beta_tester?: boolean
          beta_joined_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          created_at?: string | null
          updated_at?: string | null
          email?: string | null
          is_dj?: boolean
          is_beta_tester?: boolean
          beta_joined_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      song_requests: {
        Row: {
          artist: string | null
          content: string | null
          created_at: string | null
          id: string
          song_title: string | null
          status: string | null
          stream_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          artist?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          song_title?: string | null
          status?: string | null
          stream_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          artist?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          song_title?: string | null
          status?: string | null
          stream_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_requests_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "song_requests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          stream_id: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          stream_id?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          stream_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stream_chat_messages_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_chat_messages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stream_viewers: {
        Row: {
          joined_at: string | null
          left_at: string | null
          stream_id: string | null
          user_id: string | null
          id: string
        }
        Insert: {
          joined_at?: string | null
          left_at?: string | null
          stream_id?: string | null
          user_id?: string | null
          id?: string
        }
        Update: {
          joined_at?: string | null
          left_at?: string | null
          stream_id?: string | null
          user_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stream_viewers_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stream_viewers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webrtc_signals: {
        Row: {
          created_at: string | null
          from_peer_id: string
          id: string
          signal_data: Json | null
          stream_id: string
          to_peer_id: string
        }
        Insert: {
          from_peer_id: string
          id?: string
          signal_data: Json | null
          stream_id: string
          to_peer_id: string
        }
        Update: {
          from_peer_id?: string
          id?: string
          signal_data?: Json | null
          stream_id?: string
          to_peer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webrtc_signals_stream_id_fkey"
            columns: ["stream_id"]
            referencedRelation: "live_streams"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_codes: {
        Row: {
          id: string
          code: string
          description: string | null
          max_uses: number | null
          uses: number
          created_at: string
          expires_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          max_uses?: number | null
          uses?: number
          created_at?: string
          expires_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          max_uses?: number | null
          uses?: number
          created_at?: string
          expires_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_decrement_viewer_count_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_increment_viewer_count_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_webrtc_signals_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decrement_viewer_count: {
        Args: { stream_id: string }
        Returns: undefined
      }
      increment_viewer_count: {
        Args: { stream_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
