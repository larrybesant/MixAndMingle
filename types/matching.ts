// Database types for matching system

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  music_preferences: string[] | null;
  is_dj: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSwipe {
  id: string;
  swiper_id: string;
  swiped_id: string;
  action: 'like' | 'pass' | 'super_like';
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  is_active: boolean;
  last_message_at: string | null;
}

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'emoji' | 'image';
  is_read: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  min_age: number;
  max_age: number;
  preferred_distance: number;
  music_genres: string[] | null;
  show_me: 'all' | 'djs_only' | 'non_djs';
  location_lat: number | null;
  location_lng: number | null;
  updated_at: string;
}

export interface PotentialMatch {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  music_preferences: string[] | null;
  is_dj: boolean;
  age: number;
}

export interface MatchWithProfile extends Match {
  other_user: Profile;
  last_message?: MatchMessage;
}
