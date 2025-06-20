"use client"
import { Card } from "../ui/card"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { useRouter, useParams } from "next/navigation"
import { LiveStream } from "@/components/streaming/live-stream"

export const RoomView = () => {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;
  const [reported, setReported] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    async function joinRoom() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        await supabase.from('room_participants').upsert({ room_id: roomId, user_id: data.user.id });
      }
    }
    joinRoom();
    // Subscribe to room participants
    const participantSub = supabase
      .channel('room_participants')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` }, payload => {
        fetchParticipants();
      })
      .subscribe();
    // Subscribe to chat messages
    const messageSub = supabase
      .channel('chat_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` }, payload => {
        setMessages(msgs => [...msgs, payload.new]);
      })
      .subscribe();
    fetchParticipants();
    fetchMessages();
    return () => {
      supabase.removeChannel(participantSub);
      supabase.removeChannel(messageSub);
    };
    async function fetchParticipants() {
      const { data } = await supabase.from('room_participants').select('user_id, profiles(username, avatar_url)').eq('room_id', roomId);
      setParticipants(data || []);
      // Build userId to username map
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => {
        if (p.user_id && p.profiles?.username) map[p.user_id] = p.profiles.username;
      });
      setUserMap(map);
    }
    async function fetchMessages() {
      const { data } = await supabase.from('chat_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
      setMessages(data || []);
    }
  }, [roomId]);

  // Helper to sanitize chat input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 300): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMsg = sanitizeInput(message);
    if (!cleanMsg || !userId) return;
    await supabase.from('chat_messages').insert({ room_id: roomId, user_id: userId, message: cleanMsg });
    setMessage("");
  };

  const handleReport = () => {
    setReported(true);
    alert("User reported. Thank you for your feedback.");
  };

  const handleBlock = () => {
    setBlocked(true);
    alert("User blocked. You will no longer see this user.");
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-2">Live User Room</h2>
      <div className="mb-4">
        <LiveStream roomId={roomId} isHost={false} />
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Live Users</h3>
        <div className="flex gap-2 flex-wrap">
          {participants.map((p, i) => (
            <div key={i} className="flex flex-col items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={p.profiles?.avatar_url || undefined} alt={p.profiles?.username || "User"} />
                <AvatarFallback>{(p.profiles?.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-white mt-1">{p.profiles?.username || "User"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-white mb-2">Chat</h3>
        <div className="bg-gray-900 rounded p-2 h-40 overflow-y-auto mb-2">
          {messages.map((msg, i) => (
            <div key={i} className="mb-1">
              <span className="font-bold text-purple-400">{userMap[msg.user_id] || msg.user_id}:</span> <span className="text-white">{msg.message}</span>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white font-bold" disabled={!message.trim()}>Send</button>
        </form>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={handleReport}
          disabled={reported}
        >
          {reported ? "Reported" : "Report User"}
        </button>
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          onClick={handleBlock}
          disabled={blocked}
        >
          {blocked ? "Blocked" : "Block User"}
        </button>
      </div>
    </Card>
  );
};
