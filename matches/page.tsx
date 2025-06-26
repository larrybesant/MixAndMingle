"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Music, ArrowLeft } from "lucide-react";
import { MatchWithProfile } from "@/types/matching";
import { toast } from "@/hooks/use-toast";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/matching/matches");
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      } else {
        toast({
          title: "Error",
          description: "Failed to load matches",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white/80">Loading your matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Heart className="w-6 h-6 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Your Matches</h1>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-600/20 text-purple-300 border-purple-500/30"
            >
              {matches.length} matches
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {matches.length === 0 ? (
          <div className="text-center space-y-6 py-16">
            <div className="text-6xl mb-4">💕</div>
            <h2 className="text-3xl font-bold text-white">No Matches Yet</h2>
            <p className="text-white/80 text-lg max-w-md mx-auto">
              Start swiping to find people who share your music taste and make
              meaningful connections!
            </p>
            <Link href="/discover">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Heart className="w-4 h-4 mr-2" />
                Start Discovering
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl 
                          border border-white/10 rounded-3xl overflow-hidden hover:scale-[1.02] 
                          transition-all duration-300 group"
              >
                {/* Profile Image */}
                <div className="relative h-48">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: match.other_user.avatar_url
                        ? `url(${match.other_user.avatar_url})`
                        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* DJ Badge */}
                  {match.other_user.is_dj && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-purple-600/90 text-white border-purple-400/50 backdrop-blur-sm">
                        <Music className="w-3 h-3 mr-1" />
                        DJ
                      </Badge>
                    </div>
                  )}

                  {/* Match Date */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      variant="secondary"
                      className="bg-black/50 text-white border-white/20 backdrop-blur-sm text-xs"
                    >
                      {new Date(match.matched_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Name and Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 border-2 border-white/20">
                      <AvatarImage
                        src={match.other_user.avatar_url || undefined}
                      />
                      <AvatarFallback className="bg-purple-600 text-white">
                        {match.other_user.full_name?.[0] ||
                          match.other_user.username?.[0] ||
                          "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">
                        {match.other_user.full_name ||
                          match.other_user.username}
                      </h3>
                      <p className="text-white/60 text-sm">
                        Matched{" "}
                        {new Date(match.matched_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  {match.other_user.bio && (
                    <p className="text-white/80 text-sm line-clamp-2">
                      {match.other_user.bio}
                    </p>
                  )}

                  {/* Music Preferences */}
                  {match.other_user.music_preferences &&
                    match.other_user.music_preferences.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {match.other_user.music_preferences
                          .slice(0, 2)
                          .map((genre, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs"
                            >
                              {genre}
                            </Badge>
                          ))}
                        {match.other_user.music_preferences.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs"
                          >
                            +{match.other_user.music_preferences.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                  {/* Action Button */}
                  <Link
                    href={`/messages?match=${match.id}`}
                    className="block w-full"
                  >
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 
                                hover:from-purple-700 hover:to-blue-700 
                                group-hover:scale-[1.02] transition-all duration-300"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
