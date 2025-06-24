"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CommunityService } from "@/lib/services/community-service";
import { ROOM_CATEGORIES } from "@/lib/room-categories";
import type { CommunityWithDetails, CommunityPost, CommunityEvent } from "@/types/community";
import type { User } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import toast, { Toaster } from 'react-hot-toast';

export default function CommunityDetailPage() {  const params = useParams();
  const router = useRouter();
  const communityId = params?.id as string;
  
  if (!communityId) {
    router.replace("/communities");
    return null;
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [community, setCommunity] = useState<CommunityWithDetails | null>(null);  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'events' | 'members'>('posts');
  const [newPostContent, setNewPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
    }
    getUser();
  }, [router]);

  useEffect(() => {
    async function fetchCommunity() {
      if (!user || !communityId) return;
      
      try {
        setLoading(true);
        const communityData = await CommunityService.getCommunityById(communityId);
        setCommunity(communityData);
      } catch (error) {
        console.error("Error fetching community:", error);
        router.replace("/communities");
      } finally {
        setLoading(false);
      }
    }

    fetchCommunity();
  }, [user, communityId, router]);
  const handleJoinCommunity = async () => {
    if (!community || !user) return;
    
    try {
      setIsJoining(true);
      await CommunityService.joinCommunity(community.id);
      // Refresh community data
      const communityData = await CommunityService.getCommunityById(community.id);
      setCommunity(communityData);
      toast.success('Successfully joined community!');
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error(error.message || 'Failed to join community');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!community || !user) return;
    
    try {
      setIsLeaving(true);
      await CommunityService.leaveCommunity(community.id);
      // Refresh community data
      const communityData = await CommunityService.getCommunityById(community.id);
      setCommunity(communityData);
      toast.success('Left community');
    } catch (error: any) {
      console.error("Error leaving community:", error);
      toast.error(error.message || 'Failed to leave community');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!community || !user || !newPostContent.trim()) return;

    try {
      setIsPosting(true);      await CommunityService.createPost(
        community.id,
        newPostContent.trim()
      );
      setNewPostContent("");      // Refresh community data to show new post
      const communityData = await CommunityService.getCommunityById(community.id);
      setCommunity(communityData);
      toast.success('Post created successfully!');
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Community not found</h2>
          <Link 
            href="/communities"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Browse Communities
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = ROOM_CATEGORIES.find(cat => cat.id === community.category_id);
  return (
    <div className="min-h-screen bg-black text-white">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }}
      />
      {/* Header Banner */}
      <div className="relative h-64 lg:h-80">
        {community.banner_url ? (
          <Image
            src={community.banner_url}
            alt={community.name}
            fill
            className="object-cover"
          />
        ) : (          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 flex items-center justify-center">
            {categoryInfo?.icon ? (
              <categoryInfo.icon className="w-20 h-20 text-white" />
            ) : (
              <span className="text-8xl">🏘️</span>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Community Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl lg:text-4xl font-bold">{community.name}</h1>
                  {community.is_private && (
                    <span className="bg-yellow-600/80 text-yellow-100 px-3 py-1 rounded-full text-sm">
                      Private
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <span>{community.member_count} members</span>
                  <span>•</span>
                  <span>{categoryInfo?.name || "General"}</span>
                  {community.creator && (
                    <>
                      <span>•</span>
                      <span>Created by @{community.creator.username}</span>
                    </>
                  )}
                </div>
                {community.description && (
                  <p className="mt-2 text-gray-300 max-w-2xl">{community.description}</p>
                )}
              </div>
                <div className="flex gap-3">
                {community.is_member ? (
                  <button
                    onClick={handleLeaveCommunity}
                    disabled={isLeaving}
                    className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    {isLeaving ? (
                      <>
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                        Leaving...
                      </>
                    ) : (
                      'Leave Community'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleJoinCommunity}
                    disabled={isJoining}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    {isJoining ? (
                      <>
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Community'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {community.tags.map(tag => (
              <span
                key={tag}
                className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'posts'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'events'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'members'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Members
          </button>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Create Post (only for members) */}
            {community.is_member && (
              <div className="bg-gray-900 rounded-xl p-6">
                <form onSubmit={handleCreatePost}>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Share something with the community..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-400">
                      {newPostContent.length}/1000 characters
                    </span>
                    <button
                      type="submit"
                      disabled={!newPostContent.trim() || isPosting}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      {isPosting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts List */}
            {community.recent_posts && community.recent_posts.length > 0 ? (
              <div className="space-y-4">
                {community.recent_posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                <p className="text-gray-400">
                  {community.is_member 
                    ? "Be the first to share something!" 
                    : "Join the community to see and create posts"}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            {community.upcoming_events && community.upcoming_events.length > 0 ? (
              community.upcoming_events.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                <p className="text-gray-400">Check back later for community events</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Members</h3>
            <p className="text-gray-400">
              This community has {community.member_count} members
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Member list feature coming soon
            </p>
          </div>
        )}

        {/* Community Rules */}
        {community.rules && (
          <div className="mt-8 bg-gray-900 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Community Rules</h3>
            <div className="text-gray-300 whitespace-pre-wrap">{community.rules}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: CommunityPost }) {
  const timeAgo = new Date(post.created_at).toLocaleDateString();
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
          U
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Community Member</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">{timeAgo}</span>
          </div>
          <div className="text-gray-300 whitespace-pre-wrap">{post.content}</div>
          
          {/* Post actions */}
          <div className="flex items-center gap-6 mt-4 text-gray-400">
            <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
              <span>👍</span>
              <span>{post.like_count || 0}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-purple-400 transition-colors">
              <span>💬</span>
              <span>{post.comment_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: CommunityEvent }) {
  const eventDate = new Date(event.start_time).toLocaleDateString();
  
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-xl">📅</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
          {event.description && (
            <p className="text-gray-300 mb-3">{event.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>📅 {eventDate}</span>
            <span>🏷️ {event.event_type}</span>
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
