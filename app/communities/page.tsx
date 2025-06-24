"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CommunityService } from "@/lib/services/community-service";
import { ROOM_CATEGORIES } from "@/lib/room-categories";
import type { CommunityWithDetails } from "@/types/community";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import toast, { Toaster } from 'react-hot-toast';
import { ImageUpload } from "@/components/ui/image-upload";

export default function CommunitiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<CommunityWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);
  const router = useRouter();

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
    async function fetchCommunities() {
      if (!user) return;
      
      try {
        setLoading(true);
        const communityData = await CommunityService.getPublicCommunities(
          0,
          20,
          selectedCategory || undefined,
          searchQuery || undefined
        );
        setCommunities(communityData);
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, [user, selectedCategory, searchQuery]);

  // Real-time subscriptions for community updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to community member changes for real-time member count updates
    const memberSubscription = supabase
      .channel('community-members')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'community_members' 
        }, 
        (payload: any) => {
          // Refresh communities when someone joins/leaves
          setCommunities(prev => prev.map(community => {
            if (community.id === payload.new?.community_id || community.id === payload.old?.community_id) {
              // Update member count based on action
              const isJoin = payload.eventType === 'INSERT';
              const isLeave = payload.eventType === 'DELETE';
              return {
                ...community,
                member_count: isJoin 
                  ? community.member_count + 1 
                  : isLeave 
                    ? Math.max(0, community.member_count - 1)
                    : community.member_count
              };
            }
            return community;
          }));
        }
      )
      .subscribe();

    // Subscribe to new communities
    const communitySubscription = supabase
      .channel('communities')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'communities' 
        }, 
        async (payload: any) => {
          // Add new community to the list if it matches current filters
          if (payload.new) {
            const newCommunity = payload.new as any;
            if ((!selectedCategory || newCommunity.category_id === selectedCategory) &&
                (!searchQuery || newCommunity.name.toLowerCase().includes(searchQuery.toLowerCase()))) {
              // Fetch full community details
              try {
                const communityData = await CommunityService.getPublicCommunities(0, 1, undefined, undefined);
                const latestCommunity = communityData.find(c => c.id === newCommunity.id);
                if (latestCommunity) {
                  setCommunities(prev => [latestCommunity, ...prev]);
                  toast.success(`New community "${newCommunity.name}" was created!`);
                }
              } catch (error) {
                console.error('Error fetching new community details:', error);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      memberSubscription.unsubscribe();
      communitySubscription.unsubscribe();
    };
  }, [user, selectedCategory, searchQuery]);

  const handleCreateCommunity = () => {
    setShowCreateForm(true);
  };
  const handleJoinCommunity = async (communityId: string) => {
    if (!user) return;
    
    try {
      setJoiningCommunity(communityId);
      await CommunityService.joinCommunity(communityId);
      
      // Refresh communities list
      const communityData = await CommunityService.getPublicCommunities(
        0,
        20,
        selectedCategory || undefined,
        searchQuery || undefined
      );
      setCommunities(communityData);
      toast.success('Successfully joined community!');
    } catch (error: any) {
      console.error("Error joining community:", error);
      toast.error(error.message || 'Failed to join community');
    } finally {
      setJoiningCommunity(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading communities...</p>
        </div>
      </div>
    );
  }
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Communities
            </h1>
            <p className="text-gray-400">Discover and join communities that match your interests</p>
          </div>
          <button
            onClick={handleCreateCommunity}
            className="mt-4 lg:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Create Community
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>          <div className="lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {ROOM_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Communities Grid */}
        {communities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="text-xl font-semibold mb-2">No communities found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedCategory 
                ? "Try adjusting your search or filters" 
                : "Be the first to create a community!"}
            </p>
            <button
              onClick={handleCreateCommunity}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            >
              Create Community
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={() => handleJoinCommunity(community.id)}
                user={user}
                isJoining={joiningCommunity === community.id}
              />
            ))}
          </div>
        )}

        {/* Create Community Modal */}
        {showCreateForm && (
          <CreateCommunityModal
            onClose={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              // Refresh communities
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
}

function CommunityCard({ 
  community, 
  onJoin, 
  user,
  isJoining 
}: { 
  community: CommunityWithDetails;
  onJoin: () => void;
  user: User | null;
  isJoining?: boolean;
}) {
  const categoryInfo = ROOM_CATEGORIES.find(cat => cat.id === community.category_id);

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-all duration-300 group cursor-pointer">
      <Link href={`/communities/${community.id}`}>
        <div className="relative h-48">
          {community.banner_url ? (
            <Image
              src={community.banner_url}
              alt={community.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (            <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
              {categoryInfo?.icon ? (
                <categoryInfo.icon className="w-12 h-12 text-white" />
              ) : (
                <span className="text-4xl">🏘️</span>
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg mb-1 truncate">{community.name}</h3>
            <p className="text-gray-300 text-sm opacity-90">{community.member_count} members</p>
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full">
            {categoryInfo?.name || "General"}
          </span>
          {community.is_private && (
            <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full">
              Private
            </span>
          )}
        </div>
        
        {community.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {community.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {community.creator.avatar_url ? (
              <Image
                src={community.creator.avatar_url}
                alt={community.creator.username}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs">
                {community.creator.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-gray-400 text-sm">@{community.creator.username}</span>
          </div>          {!community.is_member && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onJoin();
              }}
              disabled={isJoining}
              className="text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-3 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
            >
              {isJoining ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                'Join'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateCommunityModal({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void;
  onSuccess: () => void;
}) {  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    is_private: false,
    max_members: 1000,
    rules: "",
    tags: [] as string[],
    avatar_url: "",
    banner_url: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id) {
      setError("Name and category are required");
      return;
    }    try {
      setLoading(true);
      setError("");
      await CommunityService.createCommunity(formData);
      toast.success('Community created successfully!');
      onSuccess();
    } catch (error: any) {
      setError(error.message || "Failed to create community");
      toast.error(error.message || "Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Create Community</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-600/20 border border-red-600/30 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter community name"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Community Avatar
              </label>
              <div className="mb-4">
                <ImageUpload
                  onImageUploadedAction={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                  currentImage={formData.avatar_url}
                  type="avatar"
                  className="w-32 h-32 mx-auto"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Community Banner
              </label>
              <div className="mb-4">
                <ImageUpload
                  onImageUploadedAction={(url) => setFormData(prev => ({ ...prev, banner_url: url }))}
                  currentImage={formData.banner_url}
                  type="banner"
                  className="w-full h-32"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {ROOM_CATEGORIES.map(category => (                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your community"
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (max 5)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Add a tag"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-purple-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="private"
                checked={formData.is_private}
                onChange={(e) => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="private" className="text-sm text-gray-300">
                Make this community private (invite-only)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Members
              </label>
              <input
                type="number"
                value={formData.max_members}
                onChange={(e) => setFormData(prev => ({ ...prev, max_members: parseInt(e.target.value) || 1000 }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                min={1}
                max={10000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Community Rules
              </label>
              <textarea
                value={formData.rules}
                onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Set community guidelines and rules"
                rows={4}
                maxLength={2000}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Community"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
