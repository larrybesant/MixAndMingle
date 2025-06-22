"use client";

import { useState, useEffect } from 'react';
import { Card } from "../ui/card";
import { DailyLiveStream } from "../streaming/daily-live-stream";
import { ChatRoom } from "../chat/chat-room";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Users, Heart, Share2, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface RoomViewProps {
  roomId: string;
}

interface RoomData {
  id: string;
  name: string;
  description: string;
  genre: string;
  host_id: string;
  is_live: boolean;
  viewer_count: number;
  tags: string[];
  host: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export function RoomView({ roomId }: RoomViewProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoomData();
    checkUserStatus();
  }, [roomId]);  const fetchRoomData = async () => {
    try {
      // First get room data
      const { data: roomData, error: roomError } = await supabase
        .from('dj_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        console.error('Error fetching room:', roomError);
        return;
      }

      // Then get host profile
      const { data: hostData, error: hostError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', (roomData as any).host_id)
        .single();

      if (hostError || !hostData) {
        console.error('Error fetching host:', hostError);
        return;
      }

      setRoomData({
        ...(roomData as any),
        host: hostData
      } as RoomData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserStatus = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      setCurrentUser(user.user);
      if (roomData) {
        setIsHost(user.user.id === roomData.host_id);
      }
    }
  };

  const joinRoom = async () => {
    if (!currentUser) return;

    await supabase
      .from('room_participants')
      .upsert({
        room_id: roomId,
        user_id: currentUser.id,
        joined_at: new Date().toISOString()
      });
  };

  const leaveRoom = async () => {
    if (!currentUser) return;

    await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', currentUser.id);
  };

  useEffect(() => {
    if (roomData && currentUser) {
      setIsHost(currentUser.id === roomData.host_id);
      if (!isHost) {
        joinRoom();
      }
    }
  }, [roomData, currentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white/80">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">Room Not Found</h2>
          <p className="text-white/60">This room doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      {/* Room Header */}
      <div className="sticky top-0 z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12 border-2 border-purple-500/50">
                <AvatarImage src={roomData.host.avatar_url} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {roomData.host.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-white">{roomData.name}</h1>
                <div className="flex items-center space-x-3">
                  <span className="text-white/60">by {roomData.host.username}</span>
                  <Badge variant="secondary" className="bg-purple-600/20 text-purple-300">
                    {roomData.genre}
                  </Badge>
                  {roomData.is_live && (
                    <Badge className="bg-red-500 text-white animate-pulse">
                      LIVE
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-white/60">
                <Users className="w-4 h-4" />
                <span>{roomData.viewer_count} viewers</span>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Share2 className="w-4 h-4" />
              </Button>
              {isHost && (
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {roomData.description && (
            <p className="text-white/80 mt-2 max-w-2xl">{roomData.description}</p>
          )}

          {roomData.tags && roomData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {roomData.tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-white/10 text-white border-white/20"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Stream */}
          <div className="lg:col-span-2">            <DailyLiveStream
              roomId={roomId}
              isHost={isHost}
              hostInfo={roomData.host}
              initialViewerCount={roomData.viewer_count}
            />
          </div>

          {/* Chat */}
          <div className="lg:col-span-1">
            <ChatRoom roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
}
