export interface Community {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  genre_id: string | null;
  creator_id: string;
  avatar_url: string | null;
  banner_url: string | null;
  is_private: boolean;
  invite_code: string;
  member_count: number;
  max_members: number;
  rules: string | null;
  tags: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: 'creator' | 'admin' | 'moderator' | 'member';
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  title: string | null;
  content: string;
  type: 'text' | 'image' | 'video' | 'poll' | 'event';
  media_urls: string[];
  is_pinned: boolean;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  creator_id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_time: string;
  end_time: string | null;
  location: string | null;
  max_attendees: number | null;
  attendee_count: number;
  is_featured: boolean;
  settings: Record<string, any>;
  created_at: string;
}

export interface CommunityJoinRequest {
  id: string;
  community_id: string;
  user_id: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  category_id: string;
  genre_id?: string;
  is_private?: boolean;
  max_members?: number;
  rules?: string;
  tags?: string[];
  avatar_url?: string;
  banner_url?: string;
}

export interface CommunityWithDetails extends Community {
  creator: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  is_member: boolean;
  user_role: string | null;
  recent_posts: CommunityPost[];
  upcoming_events: CommunityEvent[];
}
