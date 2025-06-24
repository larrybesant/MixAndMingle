"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useFriends, useRecentMessages } from "@/lib/friends-messages-hooks";
import { useOnboarding } from "@/contexts/onboarding-context";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import ProgressTracker from "@/components/onboarding/ProgressTracker";
import type { Profile } from "@/types/database";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useAuth } from '@/contexts/auth-context';

// Extend Profile for dashboard (temporary until unified in types/database.ts)
type DashboardProfile = Profile & {
  relationship_style?: string | null;
  bdsm_preferences?: string | null;
  show_bdsm_public?: boolean;
  is_dating_visible?: boolean;
  profiles?: { avatar_url?: string | null; username?: string | null };
};

// Component that handles search params (needs Suspense boundary)
function DashboardWithSearchParams() {
  const { user: contextUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [showTour, setShowTour] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Onboarding hooks
  const { 
    onboardingState, 
    getOnboardingProgress, 
    markFirstLoginComplete,
    shouldShowRetentionNudge 
  } = useOnboarding();

  // Friends and messages hooks
  const { friends = [], loading: friendsLoading } = useFriends(user?.id || null);
  const { conversations = [], loading: messagesLoading } = useRecentMessages(user?.id || null);

  // Use context user if available
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    }
  }, [contextUser]);

  // Only fetch user from supabase if contextUser is not available
  useEffect(() => {
    async function getUser() {
      if (!contextUser) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.replace("/login");
          return;
        }
        setUser(data.user);
      }
    }
    getUser();
  }, [contextUser, router]);

  useEffect(() => {
    async function getProfile() {
      if (!user) return;
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, music_preferences, created_at, gender, relationship_style, bdsm_preferences, show_bdsm_public, is_dating_visible")
        .eq("id", user.id)
        .single();
      if (profileData) {
        setProfile({
          id: String(profileData.id),
          full_name: typeof profileData.full_name === "string" ? profileData.full_name : null,
          username: typeof profileData.username === "string" ? profileData.username : null,
          avatar_url: typeof profileData.avatar_url === "string" ? profileData.avatar_url : null,
          bio: typeof profileData.bio === "string" ? profileData.bio : null,
          music_preferences: Array.isArray(profileData.music_preferences)
            ? profileData.music_preferences
            : (typeof profileData.music_preferences === "string"
                ? [profileData.music_preferences]
                : []),
          created_at: String(profileData.created_at),
          gender: typeof profileData.gender === "string" ? profileData.gender : undefined,
          relationship_style: typeof profileData.relationship_style === "string" ? profileData.relationship_style : null,
          bdsm_preferences: typeof profileData.bdsm_preferences === "string" ? profileData.bdsm_preferences : null,
          show_bdsm_public: Boolean(profileData.show_bdsm_public),
          is_dating_visible: Boolean(profileData.is_dating_visible),
        });
      } else {
        setProfile(null);
      }
      
      // Redirect to profile setup if incomplete
      if (!profileData || !profileData.username || !profileData.bio || !profileData.music_preferences || !profileData.avatar_url) {
        router.replace("/setup-profile");
        return;
      }
      
      setLoading(false);
    }
    if (user) getProfile();
  }, [user, router]);
  // Check for tour trigger from URL params
  useEffect(() => {
    if (!searchParams) return;
    
    const showTourParam = searchParams.get('show_tour');
    const loginError = searchParams.get('login_error');
    const profileError = searchParams.get('profile_error');
    
    if (showTourParam === 'true' && !onboardingState.tourComplete) {
      setShowTour(true);
    }
    
    if (loginError === 'true') {
      setFormMessage('There was an issue with your login. Please try again if you continue to experience problems.');
    }
    
    if (profileError === 'true') {
      setFormMessage('There was an issue loading your profile. Some features may not work correctly.');
    }
    
    // Mark first login as complete
    if (!onboardingState.firstLoginComplete) {
      markFirstLoginComplete();
    }
  }, [searchParams, onboardingState, markFirstLoginComplete]);

  // Auto-show tour for new users
  useEffect(() => {
    if (!loading && profile && !onboardingState.tourComplete && !showTour) {
      // Show tour after a brief delay for new users
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [loading, profile, onboardingState.tourComplete, showTour]);

  // Profile completeness logic
  function getProfileCompleteness(profile: DashboardProfile | null) {
    if (!profile) return 0;
    let complete = 0;
    let total = 6; // username, bio, music_preferences, avatar_url, gender, relationship_style
    if (profile.username) complete++;
    if (profile.bio) complete++;
    if (profile.music_preferences && profile.music_preferences.length > 0) complete++;
    if (profile.avatar_url) complete++;
    if (profile.gender) complete++;
    if (profile.relationship_style) complete++;
    return Math.round((complete / total) * 100);
  }
  const completeness = getProfileCompleteness(profile);
  const missingFields = [];
  if (profile) {
    if (!profile.username) missingFields.push("Username");
    if (!profile.bio) missingFields.push("Bio");
    if (!profile.music_preferences || profile.music_preferences.length === 0) missingFields.push("Music Preferences");
    if (!profile.avatar_url) missingFields.push("Avatar");
    if (!profile.gender) missingFields.push("Gender");
    if (!profile.relationship_style) missingFields.push("Relationship Style");
  }

  // Debug: log user/context state on mount and after login
  useEffect(() => {
    console.log('Dashboard mount:', { contextUser, user, profile, loading });
  }, [contextUser, user, profile, loading]);

  // Show loading spinner if user/context is not ready
  if (!contextUser && loading) {
    return <div className="text-white p-8 animate-pulse">Loading user session...</div>;
  }

  if (loading) return <div className="text-white p-8 animate-pulse">Loading...</div>;
  return (
    <ErrorBoundary>
      {/* Onboarding Tour */}
      {showTour && (        <OnboardingTour
          onCompleteAction={() => {
            setShowTour(false);
            // Clean up URL param
            const url = new URL(window.location.href);
            url.searchParams.delete('show_tour');
            window.history.replaceState({}, '', url.toString());
          }}
          onSkipAction={() => {
            setShowTour(false);
            // Clean up URL param
            const url = new URL(window.location.href);
            url.searchParams.delete('show_tour');
            window.history.replaceState({}, '', url.toString());
          }}
        />
      )}      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white">
        {/* Top Header */}
        <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold">♬</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome back!</h1>
                  <p className="text-gray-300 text-sm">@{profile?.username || user?.email?.split('@')[0] || "User"}</p>
                </div>
              </div>
              <button
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Sign out and return to home page"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Onboarding Progress Tracker */}
          {shouldShowRetentionNudge() && getOnboardingProgress() < 100 && (
            <div className="mb-8">
              <ProgressTracker compact={true} />
            </div>
          )}

          {/* Status Messages */}
          {formMessage && (
            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-lg backdrop-blur-sm">
              {formMessage}
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">            {/* Left Column - Profile & Quick Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt="Profile" width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold">♬</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{profile?.full_name || profile?.username || "Complete Your Profile"}</h2>
                    <p className="text-gray-300">@{profile?.username || "username"}</p>
                  </div>
                </div>

                {/* Profile completeness */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Profile completeness</span>
                    <span className="text-sm font-bold">{completeness}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" 
                      style={{ width: `${completeness}%` }} 
                    />
                  </div>
                  {completeness < 100 && (
                    <div className="text-xs text-yellow-300 mb-2">Complete your profile for the best experience!</div>
                  )}
                  {completeness < 100 && (
                    <Link 
                      href="/create-profile" 
                      className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium text-center hover:from-blue-700 hover:to-purple-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      Complete Profile
                    </Link>
                  )}
                </div>

                {/* Quick Profile Edit */}
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setFormMessage(null);
                    if (!profile?.username) {
                      setFormMessage("Username is required.");
                      return;
                    }
                    const { error } = await supabase.from("profiles").update({ username: profile.username }).eq("id", user?.id ?? "");
                    if (error) {
                      setFormMessage("Failed to update profile. Try again.");
                    } else {
                      setFormMessage("Profile updated!");
                    }
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
                      Username
                    </label>
                    <input
                      className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      type="text"
                      id="username"
                      value={profile?.username || ""}
                      onChange={e => setProfile(profile ? { ...profile, username: e.target.value } : null)}
                      required
                      aria-required="true"
                      placeholder="Choose a username"
                    />
                  </div>
                  <button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    type="submit"
                  >
                    Update Username
                  </button>
                </form>

                {/* Profile Details */}
                <div className="mt-6 space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-300">Relationship Style:</span>
                    <span className="ml-2">{profile?.relationship_style ? profile.relationship_style.charAt(0).toUpperCase() + profile.relationship_style.slice(1) : "Not set"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Music Preferences:</span>
                    <span className="ml-2">{profile && Array.isArray(profile.music_preferences) ? profile.music_preferences.join(", ") : profile?.music_preferences || "Not set"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-300">Dating/Matchmaking:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${profile?.is_dating_visible ? 'bg-green-600/20 text-green-300' : 'bg-gray-600/20 text-gray-300'}`}>
                      {profile?.is_dating_visible ? "Opted In" : "Not Listed"}
                    </span>
                  </div>
                  {profile?.bdsm_preferences && (
                    <div className="bg-purple-600/20 border border-purple-500/30 p-3 rounded-lg">
                      <span className="font-medium text-purple-300">BDSM / Kink / Other:</span>
                      <span className="ml-2">{profile.bdsm_preferences}</span>
                      {profile.show_bdsm_public && <span className="ml-2 text-green-400 text-xs">(Public)</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link href="/dashboard/history" className="block bg-gray-800/50 hover:bg-gray-700/50 px-4 py-3 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400">
                    📊 My Stream History
                  </Link>
                  <Link href="/settings" className="block bg-gray-800/50 hover:bg-gray-700/50 px-4 py-3 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-gray-400">
                    ⚙️ Settings
                  </Link>
                </div>
              </div>
            </div>

            {/* Center Column - Main Navigation */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold mb-6 text-center">Explore Mix & Mingle</h3>
                <div className="grid grid-cols-1 gap-4">                  <Link 
                    href="/communities" 
                    data-tour="communities"
                    className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-6 rounded-xl font-bold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 text-center"
                  >
                    <div className="text-3xl mb-2">🏘️</div>
                    <div className="text-lg mb-1">Communities</div>
                    <div className="text-sm opacity-80">Join groups & connect</div>
                  </Link>
                  
                  <Link 
                    href="/discover" 
                    data-tour="discover"
                    className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl font-bold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                  >
                    <div className="text-3xl mb-2">🎵</div>
                    <div className="text-lg mb-1">Discover Music</div>
                    <div className="text-sm opacity-80">Find new tracks and artists</div>
                  </Link>
                  
                  <Link 
                    href="/friends" 
                    data-tour="friends"
                    className="group bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white p-6 rounded-xl font-bold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 text-center"
                  >
                    <div className="text-3xl mb-2">👥</div>
                    <div className="text-lg mb-1">Find Friends</div>
                    <div className="text-sm opacity-80">Connect with music lovers</div>
                  </Link>
                  
                  <Link 
                    href="/messages" 
                    data-tour="messages"
                    className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl font-bold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                  >
                    <div className="text-3xl mb-2">💬</div>
                    <div className="text-lg mb-1">Messages</div>
                    <div className="text-sm opacity-80">Chat with your connections</div>
                  </Link>
                  
                  <Link 
                    href="/go-live" 
                    data-tour="events"
                    className="group bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-xl font-bold transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 text-center"
                  >
                    <div className="text-3xl mb-2">🎪</div>
                    <div className="text-lg mb-1">Go Live</div>
                    <div className="text-sm opacity-80">Stream your music</div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column - Friends & Messages */}
            <div className="lg:col-span-1 space-y-6">
              {/* Friends Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Friends</h3>
                  <Link href="/friends" className="text-sm text-blue-400 hover:text-blue-300 transition">
                    View all
                  </Link>
                </div>
                {friendsLoading ? (
                  <div className="text-gray-400 italic text-center py-8">Loading friends...</div>
                ) : friends.length === 0 ? (
                  <div className="text-gray-300 italic text-center py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <div>No friends yet</div>
                    <Link href="/friends" className="inline-block mt-3 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                      Find Friends
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {friends.slice(0, 5).map((f: { id: string; avatar_url?: string | null; username?: string | null }) => (
                        <div key={f.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition">
                          <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                            <Image 
                              src={f.avatar_url || "/file.svg"} 
                              alt="avatar" 
                              width={40} 
                              height={40} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <span className="font-medium">{f.username || "Unknown"}</span>
                        </div>
                      ))}
                    </div>
                    {friends.length > 5 && (
                      <p className="text-xs text-gray-400 text-center">
                        +{friends.length - 5} more friends
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Messages Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Recent Messages</h3>
                  <Link href="/messages" className="text-sm text-blue-400 hover:text-blue-300 transition">
                    View all
                  </Link>
                </div>
                {messagesLoading ? (
                  <div className="text-gray-400 italic text-center py-8">Loading messages...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-gray-300 italic text-center py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <div>No messages yet</div>
                    <Link href="/messages" className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                      Start Chatting
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conversations.slice(0, 3).map((msg: { id: string; sender?: { avatar_url?: string | null; username?: string | null }; content?: string; message: string }) => (
                      <div key={msg.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition">
                        <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                          <Image 
                            src={msg.sender?.avatar_url || "/file.svg"} 
                            alt="avatar" 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{msg.sender?.username || "Unknown"}</p>
                          <p className="text-gray-300 text-xs truncate">
                            {msg.content ? msg.content.slice(0, 40) : msg.message.slice(0, 40)}
                            {(msg.content ? msg.content.length : msg.message.length) > 40 ? "..." : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                    {conversations.length > 3 && (
                      <p className="text-xs text-gray-400 text-center">
                        +{conversations.length - 3} more conversations
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}

export default DashboardWithSearchParams;
