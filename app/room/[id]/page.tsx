"use client";

import { useParams } from "next/navigation";
import { RoomView } from "@/components/room/room-view";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RoomPage() {
  const params = useParams();
  const roomId = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to show loading state
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Room Not Found</h1>
          <p className="text-white/60">
            The requested room could not be found.
          </p>
          <Link href="/rooms">
            <Button
              variant="outline"
              className="border-purple-400 text-purple-400 hover:bg-purple-400/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900/20 to-black">
      <RoomView roomId={roomId} />
    </div>
  );
}
