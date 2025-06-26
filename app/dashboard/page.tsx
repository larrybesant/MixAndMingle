"use client"

<<<<<<< HEAD
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
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

// Extend Profile for dashboard (temporary until unified in types/database.ts)
type DashboardProfile = Profile & {
  relationship_style?: string | null;
  bdsm_preferences?: string | null;
  show_bdsm_public?: boolean;
  is_dating_visible?: boolean;
  profiles?: { avatar_url?: string | null; username?: string | null };
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [formMessage, setFormMessage] = useState<string | null>(null);  const [showTour, setShowTour] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const { friends, loading: friendsLoading } = useFriends(user?.id || null);
  const { conversations, loading: messagesLoading } = useRecentMessages(user?.id || null);
  const { 
    onboardingState, 
    getOnboardingProgress, 
    markFirstLoginComplete,
    shouldShowRetentionNudge 
  } = useOnboarding();
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, music_preferences, created_at, gender, relationship_style, bdsm_preferences, show_bdsm_public, is_dating_visible")
        .eq("id", data.user.id)
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
    getUser();
  }, [router]);
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
      )}

      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-2 sm:px-0">
        <header>
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <div className="mb-2">Welcome, {profile?.username || user?.email || "User"}!</div>
          <div className="mb-8 text-gray-400">Your Profile</div>
        </header>

        {/* Onboarding Progress Tracker */}
        {shouldShowRetentionNudge() && getOnboardingProgress() < 100 && (
          <div className="w-full max-w-md mb-6">
            <ProgressTracker compact={true} />
          </div>
        )}

        {/* Status Messages */}
        {formMessage && (
          <div className="mb-4 p-4 bg-blue-600 text-white rounded-lg max-w-md text-center">
            {formMessage}
          </div>
        )}
        {/* Profile Editing Form */}
        <form
          className="flex flex-col gap-2 mb-6 w-full max-w-xs sm:max-w-md"
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
          <label className="text-gray-300" htmlFor="username">Username</label>
          <input
            className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            type="text"
            id="username"
            value={profile?.username || ""}
            onChange={e => setProfile(profile ? { ...profile, username: e.target.value } : null)}
            required
            aria-required="true"
            aria-label="Username"
          />
          <button className="bg-blue-600 px-4 py-2 rounded font-bold mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400" type="submit">
            Update Profile
          </button>
          {formMessage && <div className="text-sm text-white bg-black/60 rounded p-2 mt-2" aria-live="polite">{formMessage}</div>}
        </form>
        <section className="mb-4 text-center text-lg">
          <span className="font-semibold">Relationship Style:</span> {profile?.relationship_style ? profile.relationship_style.charAt(0).toUpperCase() + profile.relationship_style.slice(1) : "Not set"}
        </section>
        <section className="mb-4 text-center text-sm text-gray-300">
          <span className="font-semibold">Music Preferences:</span> {profile && Array.isArray(profile.music_preferences) ? profile.music_preferences.join(", ") : profile?.music_preferences}
        </section>
        <section className="mb-4 text-center text-sm text-gray-300">
          <span className="font-semibold">Dating/Matchmaking:</span> {profile?.is_dating_visible ? "Opted In" : "Not Listed"}
        </section>
        {profile?.bdsm_preferences && (
          <section className="mb-4 text-center text-sm bg-gray-800/80 p-3 rounded-lg">
            <span className="font-semibold text-purple-300">BDSM / Kink / Other (private):</span> {profile.bdsm_preferences}
            {profile.show_bdsm_public && <span className="ml-2 text-green-400">(Public)</span>}
          </section>
        )}
        <section className="w-full max-w-md mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-300">Profile completeness</span>
            <span className="text-sm font-bold text-white">{completeness}%</span>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div className="h-3 bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
          </div>
          {completeness < 100 && (
            <div className="text-xs text-yellow-300 mb-2">Complete your profile for the best experience!</div>
          )}
          {missingFields.length > 0 && (
            <div className="text-xs text-red-400 mb-2 flex flex-col gap-1">
              {missingFields.map((field) => (
                <span key={field}>
                  Missing: {field} {field === "Username" ? <a href="#username" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</a> : null}
                  {field === "Bio" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Music Preferences" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Avatar" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Gender" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                  {field === "Relationship Style" ? <Link href="/create-profile" className="underline text-blue-400 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-400">Edit</Link> : null}
                </span>
              ))}
            </div>
          )}
          {completeness < 100 && (
            <Link href="/create-profile" className="block mt-2 bg-blue-700 text-white px-4 py-2 rounded font-bold text-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Complete Profile</Link>
          )}        </section>
        
        {/* Main Navigation with Tour Targets */}
        <nav className="flex flex-wrap gap-4 mb-8">
          <Link 
            href="/discover" 
            data-tour="discover"
            className="bg-purple-700 text-white px-4 py-2 rounded font-bold hover:bg-purple-800 transition focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            🎵 Discover Music
          </Link>
          <Link 
            href="/friends" 
            data-tour="friends"
            className="bg-pink-700 text-white px-4 py-2 rounded font-bold hover:bg-pink-800 transition focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            👥 Find Friends
          </Link>
          <Link 
            href="/messages" 
            data-tour="messages"
            className="bg-blue-700 text-white px-4 py-2 rounded font-bold hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            💬 Messages
          </Link>
          <Link 
            href="/go-live" 
            data-tour="events"
            className="bg-green-700 text-white px-4 py-2 rounded font-bold hover:bg-green-800 transition focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            🎪 Go Live
          </Link>
        </nav>
        
        {/* Secondary Navigation */}
        <nav className="flex gap-4 mb-8">
          <Link href="/dashboard/history" className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-gray-400">My Stream History</Link>
          <Link href="/settings" className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-gray-400">Settings</Link>
        </nav>
        {/* Friends List Section */}
        <section className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-2">Friends</h2>
          {friendsLoading ? (
            <div className="text-gray-400 italic">Loading friends...</div>
          ) : friends.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 italic">You have no friends yet.</div>
          ) : (
            <ul className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 divide-y divide-gray-700">
              {friends.map((f: { id: string; avatar_url?: string | null; username?: string | null }) => (
                <li key={f.id} className="flex items-center gap-3 py-2">
                  <Image src={f.avatar_url || "/file.svg"} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full bg-gray-600" />
                  <span>{f.username || "Unknown"}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/friends" className="block mt-2 bg-blue-700 text-white px-4 py-2 rounded font-bold text-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Manage Friends</Link>
        </section>
        {/* Messenger Section */}
        <section className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-bold mb-2">Messenger</h2>
          {messagesLoading ? (
            <div className="text-gray-400 italic">Loading messages...</div>
          ) : conversations.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 italic">No recent direct messages.</div>
          ) : (
            <ul className="bg-gray-800 rounded-lg p-4 min-h-[60px] text-gray-300 divide-y divide-gray-700">
              {conversations.map((msg: { id: string; sender?: { avatar_url?: string | null; username?: string | null }; content?: string; message: string }) => (
                <li key={msg.id} className="flex items-center gap-3 py-2">
                  <Image src={msg.sender?.avatar_url || "/file.svg"} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full bg-gray-600" />
                  <span className="font-semibold">{msg.sender?.username || "Unknown"}</span>
                  <span className="mx-2 text-gray-500">→</span>
                  <span>{msg.content ? msg.content.slice(0, 40) : msg.message.slice(0, 40)}{(msg.content ? msg.content.length : msg.message.length) > 40 ? "..." : ""}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/messages" className="block mt-2 bg-blue-700 text-white px-4 py-2 rounded font-bold text-center hover:bg-blue-800 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Open Messenger</Link>
        </section>
        <button
          className="bg-red-600 px-4 py-2 rounded font-bold mt-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Sign out and return to home page"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Sign Out
        </button>
      </main>
    </ErrorBoundary>
  );
=======
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  MessageCircle,
  Heart,
  MapPin,
  Edit,
  Play,
  Headphones,
  Radio,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Mock user data for demo
  const mockUser = {
    id: "demo-user-123",
    email: "john@example.com",
    username: "john_doe",
    full_name: "John Doe",
    bio: "Music lover and aspiring DJ. Love connecting with people through beats and good vibes!",
    location: "Los Angeles, CA",
    music_preferences: ["House", "Techno", "Hip-Hop"],
    is_dj: true,
    avatar_url: "",
    profile_completed: true,
  }

  useEffect(() => {
    // Simulate loading then show dashboard
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handleSignOut = () => {
    router.push("/demo-login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="text-xl text-white">Loading your dashboard...</div>
      </div>
    )
  }

  const profileCompletion = 85

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={mockUser.avatar_url || "/placeholder.svg"} alt={mockUser.full_name} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {mockUser.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back, {mockUser.full_name?.split(" ")[0]}!</h1>
                <p className="text-gray-400">@{mockUser.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-purple-400 text-purple-400 hover:bg-purple-400/10">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/profile-setup")}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-purple-400 font-semibold">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-3" />
                  <p className="text-sm text-gray-400">
                    {profileCompletion < 100
                      ? "Complete your profile to get better matches!"
                      : "Your profile is complete!"}
                  </p>
                  {profileCompletion < 100 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        console.log("Complete Profile clicked!")
                        window.location.href = "/profile-setup"
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Complete Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Info */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={mockUser.avatar_url || "/placeholder.svg"} alt={mockUser.full_name} />
                    <AvatarFallback className="bg-purple-600 text-white text-xl">
                      {mockUser.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-white">{mockUser.full_name}</h3>
                  <p className="text-gray-400">@{mockUser.username}</p>
                  {mockUser.is_dj && (
                    <Badge className="mt-2 bg-purple-600 text-white">
                      <Headphones className="w-3 h-3 mr-1" />
                      DJ
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="text-sm">{mockUser.location}</span>
                  </div>
                  {mockUser.bio && <p className="text-sm text-gray-300">{mockUser.bio}</p>}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white mb-2">Music Preferences</p>
                  <div className="flex flex-wrap gap-1">
                    {mockUser.music_preferences?.map((genre, index) => (
                      <Badge key={index} variant="outline" className="border-purple-400 text-purple-400 text-xs">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Main Content */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => router.push("/rooms")}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-16 flex-col"
                  >
                    <Radio className="w-6 h-6 mb-1" />
                    <span className="text-sm">Join Room</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/matchmaking")}
                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 h-16 flex-col"
                  >
                    <Heart className="w-6 h-6 mb-1" />
                    <span className="text-sm">Find Matches</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/go-live")}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 flex-col"
                  >
                    <Play className="w-6 h-6 mb-1" />
                    <span className="text-sm">Go Live</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/messages")}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-16 flex-col"
                  >
                    <MessageCircle className="w-6 h-6 mb-1" />
                    <span className="text-sm">Messages</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Live Rooms */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Radio className="w-5 h-5 mr-2" />
                  Live Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "House Vibes Only", dj: "DJ Sarah", listeners: 234, genre: "House" },
                    { name: "Late Night Techno", dj: "DJ Mike", listeners: 156, genre: "Techno" },
                    { name: "Hip-Hop Classics", dj: "DJ Alex", listeners: 89, genre: "Hip-Hop" },
                  ].map((room, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-white">{room.name}</h4>
                        <p className="text-sm text-gray-400">by {room.dj}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
                            {room.genre}
                          </Badge>
                          <span className="text-xs text-gray-400">{room.listeners} listening</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Friends */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "match", text: "New match with Emma!", time: "2h ago" },
                    { type: "room", text: 'Joined "Chill Vibes" room', time: "4h ago" },
                    { type: "message", text: "Message from Alex", time: "6h ago" },
                    { type: "like", text: "Someone liked your profile", time: "1d ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{activity.text}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Friends Online */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Friends Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Emma Wilson", status: 'In "House Party" room', avatar: "" },
                    { name: "Alex Chen", status: "Listening to Techno", avatar: "" },
                    { name: "Sarah Johnson", status: "DJing live", avatar: "" },
                  ].map((friend, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friend.avatar || "/placeholder.svg"} alt={friend.name} />
                          <AvatarFallback className="bg-purple-600 text-white text-xs">
                            {friend.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{friend.name}</p>
                        <p className="text-xs text-gray-400">{friend.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demo Notice */}
            <Card className="bg-green-900/20 border-green-500/30">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                    <Play className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-green-400 font-semibold">Demo Mode Active</h3>
                  <p className="text-sm text-gray-300">
                    You're experiencing the full Mix & Mingle interface with sample data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
>>>>>>> 1ef822f059b7d81d49cba6111a546fd184845679
}
