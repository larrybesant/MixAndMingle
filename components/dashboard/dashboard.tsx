"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  LogOut,
  Edit,
  Music,
  Users,
  Calendar,
  Mail,
  MapPin,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile, loading, signOut, error } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isProfileComplete = () => {
    return profile?.username && profile?.full_name && profile?.bio;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <header className="border-b border-purple-500/30 bg-black/40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              Mix & Mingle Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/settings")}
                className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="border-red-400 text-red-400 hover:bg-red-400/10"
              >
                {isSigningOut ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Profile Completion Alert */}
        {!isProfileComplete() && (
          <div className="mb-6 p-4 bg-orange-900/20 border border-orange-500 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <p className="text-orange-400">
                  Complete your profile to get the most out of Mix & Mingle
                </p>
              </div>
              <Button
                size="sm"
                onClick={handleEditProfile}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Complete Profile
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={profile?.avatar_url}
                      alt={profile?.full_name || "User"}
                    />
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {getInitials(profile?.full_name || profile?.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">
                      {profile?.full_name || profile?.username || "User"}
                    </h2>
                    {profile?.username && profile?.full_name && (
                      <p className="text-purple-400">@{profile.username}</p>
                    )}

                    <div className="flex items-center justify-center space-x-2">
                      {user.email_confirmed_at ? (
                        <Badge
                          variant="outline"
                          className="border-green-400 text-green-400"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-orange-400 text-orange-400"
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}

                      {profile?.is_dj && (
                        <Badge className="bg-purple-600">
                          <Music className="w-3 h-3 mr-1" />
                          DJ
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {profile?.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      Bio
                    </h3>
                    <p className="text-white text-sm">{profile.bio}</p>
                  </div>
                )}

                <Separator className="bg-purple-500/30" />

                <div className="space-y-3">
                  {user.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{user.email}</span>
                    </div>
                  )}

                  {profile?.location && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{profile.location}</span>
                    </div>
                  )}

                  {profile?.website && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">
                      Joined{" "}
                      {new Date(user.created_at || "").toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator className="bg-purple-500/30" />

                <Button
                  onClick={handleEditProfile}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/matchmaking")}
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-purple-400 text-purple-400 hover:bg-purple-400/10"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Find Matches</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/go-live")}
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-blue-400 text-blue-400 hover:bg-blue-400/10"
                  >
                    <Music className="w-6 h-6" />
                    <span className="text-sm">Go Live</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push("/rooms")}
                    className="h-20 flex flex-col items-center justify-center space-y-2 border-green-400 text-green-400 hover:bg-green-400/10"
                  >
                    <Globe className="w-6 h-6" />
                    <span className="text-sm">Browse Rooms</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-black/40 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Start by finding matches or joining a live room!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Music Preferences */}
            {profile?.music_preferences &&
              profile.music_preferences.length > 0 && (
                <Card className="bg-black/40 border-purple-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Music Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {profile.music_preferences.map((genre, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-purple-400 text-purple-400"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
