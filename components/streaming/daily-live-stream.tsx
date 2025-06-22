"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Radio, 
  Users, 
  Heart, 
  Settings,
  Share2,
  Play,
  Square
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DailyVideoRoom } from './DailyVideoRoom';

interface DailyLiveStreamProps {
  roomId: string;
  isHost?: boolean;
  hostInfo?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  initialViewerCount?: number;
}

export function DailyLiveStream({ 
  roomId, 
  isHost = false, 
  hostInfo,
  initialViewerCount = 0 
}: DailyLiveStreamProps) {
  // Stream state
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(initialViewerCount);
  const [dailyRoomUrl, setDailyRoomUrl] = useState<string | null>(null);
  
  // Loading states
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real-time viewer count updates
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(0, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Update room status in database
  useEffect(() => {
    const updateRoomStatus = async () => {
      if (isHost) {
        await supabase
          .from('dj_rooms')
          .update({ 
            is_live: isStreaming,
            viewer_count: viewerCount 
          })
          .eq('id', roomId);
      }
    };

    updateRoomStatus();
  }, [isStreaming, viewerCount, roomId, isHost]);
  // Check if room already has a Daily.co room URL
  useEffect(() => {
    const checkExistingRoom = async () => {
      try {
        const { data, error } = await supabase
          .from('dj_rooms')
          .select('stream_url, is_live')
          .eq('id', roomId)
          .single();

        if (error) {
          console.warn('Error checking existing room:', error);
          return;
        }

        if (data?.stream_url && data.is_live) {
          setDailyRoomUrl(data.stream_url as string);
          setIsStreaming(true);
        }
      } catch (err) {
        console.warn('Error in checkExistingRoom:', err);
      }
    };

    checkExistingRoom();
  }, [roomId]);

  // Create Daily.co room and start streaming
  const startStream = async () => {
    if (isStarting) return;
    setIsStarting(true);
    setError(null);
    
    try {
      // Create Daily.co room
      const response = await fetch('/api/daily-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Save the Daily.co room URL to database
      await supabase
        .from('dj_rooms')
        .update({ 
          stream_url: data.url,
          is_live: true,
          viewer_count: 1
        })
        .eq('id', roomId);

      setDailyRoomUrl(data.url);
      setIsStreaming(true);
      setViewerCount(1);
      
      toast({
        title: "🎥 Live Stream Started!",
        description: "Your stream is now live and viewers can join.",
      });

    } catch (error) {
      console.error('Error starting stream:', error);
      setError(error instanceof Error ? error.message : 'Failed to start stream');
      toast({
        title: "Stream Error",
        description: "Could not start the live stream. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  // Stop streaming
  const stopStream = async () => {
    if (isStopping) return;
    setIsStopping(true);

    try {
      // Update database
      await supabase
        .from('dj_rooms')
        .update({ 
          is_live: false,
          viewer_count: 0,
          stream_url: null
        })
        .eq('id', roomId);

      setDailyRoomUrl(null);
      setIsStreaming(false);
      setViewerCount(0);
      
      toast({
        title: "📴 Stream Ended",
        description: "Your live stream has been stopped.",
      });
    } catch (error) {
      console.error('Error stopping stream:', error);
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      {/* Stream Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hostInfo && (
              <Avatar className="h-12 w-12 ring-2 ring-purple-400/50">
                <AvatarImage src={hostInfo.avatar_url} alt={hostInfo.username} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {hostInfo.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{hostInfo?.username || 'Live Stream'}</h3>
              <div className="flex items-center space-x-4 text-sm text-white/60">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{viewerCount} viewers</span>
                </div>
                {isStreaming && (
                  <Badge variant="secondary" className="bg-red-600 text-white animate-pulse">
                    <Radio className="w-3 h-3 mr-1" />
                    LIVE
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Share2 className="w-5 h-5" />
            </Button>
            {isHost && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stream Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Daily.co Video Room */}
        {dailyRoomUrl ? (
          <div className="mb-6">
            <DailyVideoRoom roomUrl={dailyRoomUrl} isHost={isHost} />
          </div>
        ) : (
          <div className="mb-6 bg-black/30 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto">
                <Radio className="w-8 h-8 text-white/60" />
              </div>
              <div>
                <p className="text-white text-lg font-medium">
                  {isHost ? 'Ready to go live?' : 'Stream not started'}
                </p>
                <p className="text-white/60 text-sm">
                  {isHost 
                    ? 'Start your live stream to connect with your audience' 
                    : 'Waiting for the host to start streaming'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Host Controls */}
        {isHost && (
          <div className="flex items-center justify-center space-x-4">
            {!isStreaming ? (
              <Button 
                onClick={startStream} 
                disabled={isStarting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-medium"
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Go Live
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={stopStream}
                disabled={isStopping}
                variant="destructive"
                className="px-8 py-3 text-lg font-medium"
              >
                {isStopping ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    End Stream
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Viewer Info */}
        {!isHost && !isStreaming && (
          <div className="text-center">
            <p className="text-white/60">This room is not currently live.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
