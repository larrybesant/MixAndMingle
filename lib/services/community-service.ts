import { supabase } from '@/lib/supabase/client';
import type { 
  Community, 
  CommunityMember, 
  CommunityPost, 
  CommunityEvent,
  CommunityJoinRequest,
  CreateCommunityData,
  CommunityWithDetails 
} from '@/types/community';

export class CommunityService {
  // Create a new community
  static async createCommunity(data: CreateCommunityData): Promise<Community> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: community, error } = await supabase
      .from('communities')
      .insert({
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        genre_id: data.genre_id,
        creator_id: user.user.id,
        is_private: data.is_private || false,
        max_members: data.max_members || 1000,
        rules: data.rules,
        tags: data.tags || [],
        avatar_url: data.avatar_url,
        banner_url: data.banner_url,
      })
      .select()
      .single();

    if (error) throw error;

    // Add creator as the first member
    await supabase
      .from('community_members')
      .insert({
        community_id: community.id,
        user_id: user.user.id,
        role: 'creator'
      });

    return community;
  }

  // Get public communities with pagination
  static async getPublicCommunities(
    page = 1, 
    limit = 20, 
    categoryFilter?: string,
    searchQuery?: string
  ): Promise<CommunityWithDetails[]> {
    let query = supabase
      .from('communities')
      .select(`
        *,
        creator:profiles!communities_creator_id_fkey(id, username, avatar_url)
      `)
      .eq('is_private', false)
      .order('member_count', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (categoryFilter) {
      query = query.eq('category_id', categoryFilter);
    }

    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }

    const { data: communities, error } = await query;
    if (error) throw error;

    // Check if user is member of each community
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const enrichedCommunities = await Promise.all(
      (communities || []).map(async (community: any) => {
        let is_member = false;
        let user_role = null;

        if (userId) {
          const { data: memberData } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', community.id)
            .eq('user_id', userId)
            .single();

          is_member = !!memberData;
          user_role = memberData?.role || null;
        }

        return {
          ...community,
          is_member,
          user_role,
          recent_posts: [],
          upcoming_events: []
        } as CommunityWithDetails;
      })
    );

    return enrichedCommunities;
  }

  // Get user's communities (joined or created)
  static async getUserCommunities(userId?: string): Promise<CommunityWithDetails[]> {
    const { data: user } = await supabase.auth.getUser();
    const targetUserId = userId || user.user?.id;
    
    if (!targetUserId) throw new Error('User not authenticated');

    const { data: memberships, error } = await supabase
      .from('community_members')
      .select(`
        role,
        community:communities(
          *,
          creator:profiles!communities_creator_id_fkey(id, username, avatar_url)
        )
      `)
      .eq('user_id', targetUserId);

    if (error) throw error;

    return (memberships || []).map((membership: { role: string; community: Community }) => ({
      ...membership.community,
      is_member: true,
      user_role: membership.role,
      recent_posts: [],
      upcoming_events: []
    })) as CommunityWithDetails[];
  }

  // Get community details
  static async getCommunityById(communityId: string): Promise<CommunityWithDetails | null> {
    const { data: community, error } = await supabase
      .from('communities')
      .select(`
        *,
        creator:profiles!communities_creator_id_fkey(id, username, avatar_url)
      `)
      .eq('id', communityId)
      .single();

    if (error || !community) return null;

    // Check if user is member
    const { data: user } = await supabase.auth.getUser();
    let is_member = false;
    let user_role = null;

    if (user.user) {
      const { data: memberData } = await supabase
        .from('community_members')
        .select('role')
        .eq('community_id', communityId)
        .eq('user_id', user.user.id)
        .single();

      is_member = !!memberData;
      user_role = memberData?.role || null;
    }

    // Get recent posts
    const { data: posts } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:profiles!community_posts_author_id_fkey(id, username, avatar_url)
      `)
      .eq('community_id', communityId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Get upcoming events
    const { data: events } = await supabase
      .from('community_events')
      .select('*')
      .eq('community_id', communityId)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(3);

    return {
      ...community,
      is_member,
      user_role,
      recent_posts: posts || [],
      upcoming_events: events || []
    } as CommunityWithDetails;
  }

  // Join a community
  static async joinCommunity(communityId: string, inviteCode?: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Get community info
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('is_private, invite_code, max_members, member_count')
      .eq('id', communityId)
      .single();

    if (communityError) throw communityError;

    // Check if community is full
    if (community.member_count >= community.max_members) {
      throw new Error('Community is full');
    }

    // For private communities, check invite code
    if (community.is_private && community.invite_code !== inviteCode) {
      throw new Error('Invalid invite code');
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('community_members')
      .select('id')
      .eq('community_id', communityId)
      .eq('user_id', user.user.id)
      .single();

    if (existingMember) {
      throw new Error('Already a member of this community');
    }

    // Join the community
    const { error } = await supabase
      .from('community_members')
      .insert({
        community_id: communityId,
        user_id: user.user.id,
        role: 'member'
      });

    if (error) throw error;
  }

  // Leave a community
  static async leaveCommunity(communityId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Check if user is the creator
    const { data: community } = await supabase
      .from('communities')
      .select('creator_id')
      .eq('id', communityId)
      .single();

    if (community?.creator_id === user.user.id) {
      throw new Error('Community creators cannot leave their own community');
    }

    const { error } = await supabase
      .from('community_members')
      .delete()
      .eq('community_id', communityId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  // Create a post in a community
  static async createPost(
    communityId: string,
    content: string,
    title?: string,
    type: 'text' | 'image' | 'video' | 'poll' | 'event' = 'text',
    mediaUrls: string[] = []
  ): Promise<CommunityPost> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        community_id: communityId,
        author_id: user.user.id,
        title,
        content,
        type,
        media_urls: mediaUrls
      })
      .select()
      .single();

    if (error) throw error;
    return post;
  }

  // Get community posts
  static async getCommunityPosts(
    communityId: string,
    page = 1,
    limit = 20
  ): Promise<CommunityPost[]> {
    const { data: posts, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        author:profiles!community_posts_author_id_fkey(id, username, avatar_url)
      `)
      .eq('community_id', communityId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return posts || [];
  }

  // Create an event in a community
  static async createEvent(
    communityId: string,
    eventData: {
      title: string;
      description?: string;
      event_type?: string;
      start_time: string;
      end_time?: string;
      location?: string;
      max_attendees?: number;
    }
  ): Promise<CommunityEvent> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data: event, error } = await supabase
      .from('community_events')
      .insert({
        community_id: communityId,
        creator_id: user.user.id,
        ...eventData
      })
      .select()
      .single();

    if (error) throw error;
    return event;
  }

  // Get community members
  static async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    const { data: members, error } = await supabase
      .from('community_members')
      .select(`
        *,
        user:profiles!community_members_user_id_fkey(id, username, avatar_url)
      `)
      .eq('community_id', communityId)
      .order('joined_at', { ascending: true });

    if (error) throw error;
    return members || [];
  }

  // Search communities
  static async searchCommunities(
    query: string,
    filters: {
      category?: string;
      genre?: string;
      isPrivate?: boolean;
    } = {}
  ): Promise<CommunityWithDetails[]> {
    let supabaseQuery = supabase
      .from('communities')
      .select(`
        *,
        creator:profiles!communities_creator_id_fkey(id, username, avatar_url)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`);

    if (filters.category) {
      supabaseQuery = supabaseQuery.eq('category_id', filters.category);
    }

    if (filters.genre) {
      supabaseQuery = supabaseQuery.eq('genre_id', filters.genre);
    }

    if (filters.isPrivate !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_private', filters.isPrivate);
    }

    const { data: communities, error } = await supabaseQuery
      .order('member_count', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Check membership status for current user
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const enrichedCommunities = await Promise.all(
      (communities || []).map(async (community: any) => {
        let is_member = false;
        let user_role = null;

        if (userId) {
          const { data: memberData } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', community.id)
            .eq('user_id', userId)
            .single();

          is_member = !!memberData;
          user_role = memberData?.role || null;
        }

        return {
          ...community,
          is_member,
          user_role,
          recent_posts: [],
          upcoming_events: []
        } as CommunityWithDetails;
      })
    );

    return enrichedCommunities;
  }

  // Get trending communities (by recent activity)
  static async getTrendingCommunities(limit = 10): Promise<CommunityWithDetails[]> {
    // Get communities with recent post activity
    const { data: communities, error } = await supabase
      .from('communities')
      .select(`
        *,
        creator:profiles!communities_creator_id_fkey(id, username, avatar_url)
      `)
      .eq('is_private', false)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    // Check membership for current user
    const { data: user } = await supabase.auth.getUser();
    const userId = user.user?.id;

    const enrichedCommunities = await Promise.all(
      (communities || []).map(async (community: any) => {
        let is_member = false;
        let user_role = null;

        if (userId) {
          const { data: memberData } = await supabase
            .from('community_members')
            .select('role')
            .eq('community_id', community.id)
            .eq('user_id', userId)
            .single();

          is_member = !!memberData;
          user_role = memberData?.role || null;
        }

        return {
          ...community,
          is_member,
          user_role,
          recent_posts: [],
          upcoming_events: []
        } as CommunityWithDetails;
      })
    );

    return enrichedCommunities;
  }
}
