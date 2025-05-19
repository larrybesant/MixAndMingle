export type Profile = {
  id: string
  first_name: string
  last_name: string
  avatar_url: string
  bio: string
  location: string
  email: string
  created_at: string
  updated_at: string
}

export type Interest = {
  id: string
  name: string
  category: string
  created_at: string
}

export type UserInterest = {
  id: string
  user_id: string
  interest: string
  created_at: string
}

export type Match = {
  id: string
  user1_id: string
  user2_id: string
  match_score: number
  status: "pending" | "accepted" | "rejected"
  created_at: string
  updated_at: string
}

export type UserLocation = {
  id: string
  user_id: string
  latitude: number
  longitude: number
  city: string
  state: string
  country: string
  last_updated: string
}

export type MatchChatRoom = {
  id: string
  match_id: string
  created_at: string
  last_message_at: string
}

export type MatchChatMessage = {
  id: string
  room_id: string
  sender_id: string
  content: string
  is_read: boolean
  attachment_url: string | null
  attachment_type: string | null
  created_at: string
}

export type UserPreference = {
  id: string
  user_id: string
  min_age: number | null
  max_age: number | null
  distance_radius: number | null
  gender_preference: string | null
  created_at: string
  updated_at: string
}
