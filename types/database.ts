export type Profile = {
  id: string
  full_name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  music_preferences: string[] | null
  created_at: string
  is_creator?: boolean
}

export type UserRoom = {
  id: string
  name: string
  description: string | null
  genre: string | null
  host_id: string
  is_live: boolean
  viewer_count: number
  tags: string[] | null
  created_at: string
}

export type ChatMessage = {
  id: string
  room_id: string
  user_id: string
  message: string
  created_at: string
}

export type RoomParticipant = {
  id: string
  room_id: string
  user_id: string
  joined_at: string
}
