"use client";

import { useParams } from "next/navigation";
import { LiveStream } from "@/components/streaming/live-stream";
import { ChatRoom } from "@/components/chat/chat-room";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";

export default function StreamPage() {
  const params = useParams();
  const roomId = params?.id as string;
  if (!roomId) {
    return <div>Room not found.</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="text-center">
          <h1 className="text-2xl font-bold">DJ Room #{roomId}</h1>
          <p className="text-gray-400">Live Stream</p>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Stream */}
        <div className="lg:col-span-2">
          <LiveStream isHost={false} roomId={roomId} />
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <ChatRoom roomId={roomId} />
        </div>
      </div>
    </main>
  );
}
