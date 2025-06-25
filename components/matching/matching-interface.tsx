"use client";

import { useState, useEffect } from "react";
import { SwipeCard } from "./swipe-card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, Zap } from "lucide-react";
import { PotentialMatch } from "@/types/matching";
import { toast } from "@/hooks/use-toast";

export function MatchingInterface() {
  const [users, setUsers] = useState<PotentialMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMatch, setIsMatch] = useState(false);

  // Fetch potential matches
  const fetchPotentialMatches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/matching/potential");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.matches || []);
        setCurrentIndex(0);
      } else {
        toast({
          title: "Error",
          description: "Failed to load potential matches",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast({
        title: "Error",
        description: "Failed to load potential matches",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle swipe action
  const handleSwipe = async (action: "like" | "pass" | "super_like") => {
    if (currentIndex >= users.length) return;

    setIsAnimating(true);
    const currentUser = users[currentIndex];

    try {
      const response = await fetch("/api/matching/swipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          swiped_id: currentUser.id,
          action,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show match celebration if it's a match
        if (data.is_match && action === "like") {
          setIsMatch(true);
          toast({
            title: "🎉 It's a Match!",
            description: `You and ${currentUser.full_name || currentUser.username} liked each other!`,
            duration: 5000,
          });

          // Hide match celebration after 3 seconds
          setTimeout(() => setIsMatch(false), 3000);
        } else if (action === "like") {
          toast({
            title: "💜 Liked!",
            description: `You liked ${currentUser.full_name || currentUser.username}`,
          });
        } else if (action === "super_like") {
          toast({
            title: "⭐ Super Liked!",
            description: `You super liked ${currentUser.full_name || currentUser.username}`,
          });
        }

        // Move to next user
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsAnimating(false);
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "Failed to record your swipe",
          variant: "destructive",
        });
        setIsAnimating(false);
      }
    } catch (error) {
      console.error("Error swiping:", error);
      toast({
        title: "Error",
        description: "Failed to record your swipe",
        variant: "destructive",
      });
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  // Load more users when running low
  useEffect(() => {
    if (currentIndex >= users.length - 2 && users.length > 0) {
      fetchPotentialMatches();
    }
  }, [currentIndex, users.length]);

  if (isLoading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white/80">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= users.length && users.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🎵</div>
          <h2 className="text-3xl font-bold text-white">No More Matches</h2>
          <p className="text-white/80 text-lg">
            You've seen all available matches in your area. Check back later for
            more people to discover!
          </p>
          <Button
            onClick={fetchPotentialMatches}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Matches
          </Button>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-white">No Matches Found</h2>
          <p className="text-white/80 text-lg">
            We couldn't find any potential matches for you right now. Try
            updating your preferences or check back later!
          </p>
          <Button
            onClick={fetchPotentialMatches}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const currentUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Header */}
      <div className="pt-6 pb-4 px-6">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-purple-400" />
            <span className="text-white font-semibold">Discover</span>
          </div>
          <div className="text-white/60 text-sm">
            {currentIndex + 1} of {users.length}
          </div>
        </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="relative">
          {/* Current Card */}
          {currentUser && (
            <SwipeCard
              user={currentUser}
              onSwipeAction={handleSwipe}
              isAnimating={isAnimating}
            />
          )}

          {/* Next Card (preview) */}
          {users[currentIndex + 1] && (
            <div className="absolute inset-0 -z-10 scale-95 opacity-50">
              <SwipeCard
                user={users[currentIndex + 1]}
                onSwipeAction={() => {}}
                isAnimating={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Hints */}
      <div className="pb-8 px-6">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-center space-x-8 text-white/60 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center">
                <span className="text-red-400 text-xs">✕</span>
              </div>
              <span>Pass</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <span>Super</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">
                <Heart className="w-4 h-4 text-green-400" />
              </div>
              <span>Like</span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Celebration Overlay */}
      {isMatch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4 animate-bounce">
            <div className="text-8xl">🎉</div>
            <h2 className="text-4xl font-bold text-white">It's a Match!</h2>
            <p className="text-white/80 text-lg">Start chatting now!</p>
          </div>
        </div>
      )}
    </div>
  );
}
