"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Message {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at?: string;
  sender?: { username?: string; avatar_url?: string };
  receiver?: { username?: string; avatar_url?: string };
}

export default function DirectChatPage({
  params,
}: {
  params: { userId: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUserAndMessages() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      setUser(userData.user);
      // Fetch messages between current user and params.userId
      const { data: messagesData } = await supabase
        .from("messages")
        .select(
          "*, sender:sender_id(username, avatar_url), receiver:receiver_id(username, avatar_url)",
        )
        .or(
          `and(sender_id.eq.${userData.user.id},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${userData.user.id})`,
        )
        .order("created_at", { ascending: true });
      setMessages(messagesData || []);
      setLoading(false);
    }
    fetchUserAndMessages();
  }, [params.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: params.userId,
      content: input.trim(),
    });
    if (!error) {
      setMessages([
        ...messages,
        {
          sender_id: user.id,
          receiver_id: params.userId,
          content: input.trim(),
          sender: { username: user.email },
          created_at: new Date().toISOString(),
        },
      ]);
      setInput("");
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center px-2 py-8">
      <h1 className="text-2xl font-bold mb-4">Direct Chat</h1>
      <div
        className="w-full max-w-md flex-1 flex flex-col bg-gray-900 rounded-lg p-4 overflow-y-auto"
        style={{ minHeight: 400 }}
      >
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender_id === user?.id ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"}`}
                >
                  <div className="text-xs font-semibold mb-1">
                    {msg.sender?.username || "You"}
                  </div>
                  <div>{msg.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      <form onSubmit={sendMessage} className="w-full max-w-md flex gap-2 mt-4">
        <input
          id="chat-input"
          name="chat-input"
          className="flex-1 p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          className="bg-blue-600 px-4 py-2 rounded font-bold"
          type="submit"
        >
          Send
        </button>
      </form>
    </main>
  );
}
