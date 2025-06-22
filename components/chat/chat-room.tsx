"use client";

import type React from "react";
import { z } from "zod";
import type { ChatMessage } from "@/types/database";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

interface ChatRoomProps {
  roomId: string;
}

const UserProfileSchema = z.object({
  username: z.string(),
  avatar_url: z.string().nullable().optional(),
});

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userProfile, setUserProfile] = useState<{
    username: string;
    avatar_url?: string;
    user_id: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Fetch current user's profile
  useEffect(() => {
    async function fetchUserProfile() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", auth.user.id)
        .single();
      if (profile) {
        // Validate profile at runtime
        const parsed = UserProfileSchema.safeParse(profile);
        if (parsed.success) {
          // Convert null avatar_url to undefined for type compatibility
          setUserProfile({
            ...parsed.data,
            avatar_url: parsed.data.avatar_url ?? undefined,
            user_id: auth.user.id, // Add the actual user ID
          });
        } else {
          setUserProfile(null);
          // Optionally log or show error
          // console.error("Invalid user profile", parsed.error);
        }
      }
    }
    fetchUserProfile();
  }, []);

  // Fetch messages from Supabase on mount
  useEffect(() => {
    async function fetchMessages() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch messages with user profile data
        const { data, error } = await supabase
          .from("chat_messages")
          .select(`
            id,
            user_id,
            message,
            created_at,
            room_id,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq("room_id", roomId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          setError("Failed to load messages.");        } else if (data) {
          // Transform the data to include profile info
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const transformedMessages = data.map((msg: any) => ({
            ...msg,
            username: msg.profiles?.username || `User ${msg.user_id.slice(0, 8)}`,
            avatar_url: msg.profiles?.avatar_url || undefined,
          }));
          setMessages(transformedMessages);
        }
      } catch (err) {
        console.error('Fetch messages error:', err);
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [roomId]);

  // Subscribe to new messages in real time
  useEffect(() => {
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload: { new: ChatMessage }) => {
          const msg = payload.new;
          
          // Fetch the user profile for this message
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', msg.user_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              room_id: msg.room_id,
              user_id: msg.user_id,
              message: msg.message,
              created_at: msg.created_at,
              username: profile?.username || `User ${msg.user_id.slice(0, 8)}`,
              avatar_url: profile?.avatar_url || undefined,
            } as Message,
          ]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to sanitize chat input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 300): string {
    return input
      .replace(/<[^>]*>?/gm, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!userProfile?.username) {
      setError("You must have a username to chat.");
      return;
    }
    const cleanMsg = sanitizeInput(newMessage);
    if (!cleanMsg) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: userProfile.user_id, // Use actual user ID
      message: cleanMsg,
    });
    setSending(false);
    if (!error) setNewMessage("");
    else setError("Failed to send message.");
  };

  const sendReaction = async (emoji: string) => {
    setError(null);
    if (!userProfile?.username) {
      setError("You must have a username to chat.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      user_id: userProfile.user_id, // Use actual user ID
      message: emoji,
    });
    setSending(false);
    if (error) setError("Failed to send reaction.");
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 h-[600px] flex flex-col max-w-full w-full sm:max-w-md mx-auto shadow-lg">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-xl font-bold text-white" id="chat-title">
          Live Chat
        </h3>
        <p className="text-gray-400 text-sm" aria-live="polite">
          {messages.length} messages
        </p>
      </div>

      {/* Loading/Error States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading messages...
        </div>
      )}
      {error && (
        <div className="flex-1 flex items-center justify-center text-red-400">
          {error}
        </div>
      )}

      {/* Messages */}
      {!loading && !error && (
        <div
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3"
          aria-labelledby="chat-title"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${msg.user_id === userProfile?.user_id ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8">
                <AvatarImage src={msg.avatar_url} alt={msg.username} />
                <AvatarFallback>{msg.username?.[0] || "?"}</AvatarFallback>{" "}
              </Avatar>
              <div
                className={`min-w-0 ${msg.user_id === userProfile?.user_id ? "bg-blue-600/20 border-blue-500/30" : "bg-slate-700/30"} rounded-lg p-3 border border-white/10 w-fit max-w-[80vw] sm:max-w-xs`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-purple-300">
                    {msg.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white text-sm break-words">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Quick Reactions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 mb-3">
          {["🔥", "💜", "🎵", "⚡", "👏", "🙌"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform duration-200"
              aria-label={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <form
          onSubmit={sendMessage}
          className="flex gap-2"
          aria-label="Send a message"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            aria-label="Message input"
            maxLength={300}
            required
            disabled={sending}
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
            aria-label="Send message"
            disabled={loading || !newMessage.trim() || sending}
          >
            {sending ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
