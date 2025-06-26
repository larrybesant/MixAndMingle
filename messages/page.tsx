"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ConversationListSchema } from "@/lib/zod-schemas-shared";

type MessageUser = {
  username: string | null;
  avatar_url: string | null;
};
type Conversation = {
  id: string;
  sender: MessageUser;
  receiver: MessageUser;
  message: string;
  created_at: string;
};

export default function MessagesPage() {
  const [, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientId, setRecipientId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserAndMessages() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!userData.user) return;
        setUser(userData.user);
        const { data: messagesData, error: msgError } = await supabase
          .from("messages")
          .select("id, message, created_at, sender:sender_id(username, avatar_url), receiver:receiver_id(username, avatar_url)")
          .or(`sender_id.eq.${userData.user.id},receiver_id.eq.${userData.user.id}`)
          .order("created_at", { ascending: false })
          .limit(20);
        if (msgError) throw msgError;
        const parsed = ConversationListSchema.safeParse(messagesData || []);
        if (!parsed.success) {
          setError("Invalid data received from server. Please try again later.");
          setConversations([]);
          return;
        }
        setConversations(parsed.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch messages.");
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndMessages();
  }, []);

  // Helper to sanitize message input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 500): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendStatus(null);
    const cleanRecipient = sanitizeInput(recipientId, 64);
    const cleanMessage = sanitizeInput(newMessage, 500);
    if (!cleanRecipient || !cleanMessage) {
      setSendStatus("Recipient and message required.");
      return;
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setSendStatus("Not authenticated.");
      return;
    }
    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: cleanRecipient,
      message: cleanMessage,
    });
    if (!error) {
      // Insert notification for recipient
      await supabase.from("notifications").insert({
        user_id: cleanRecipient,
        type: "Message",
        message: `New message from ${user.id}`,
        read: false,
      });
    }
    if (error) {
      setSendStatus("Failed to send message.");
    } else {
      setSendStatus("Message sent!");
      setNewMessage("");
      setRecipientId("");
    }
  };

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-black text-white flex flex-col items-center px-2 py-8">
        <h1 className="text-3xl font-bold mb-6">Messenger</h1>
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <section className="w-full max-w-md mb-8">
            <h2 className="text-xl font-bold mb-2">Recent Conversations</h2>
            {conversations.length === 0 ? (
              <div className="text-gray-400 italic">No messages yet.</div>
            ) : (
              <ul className="bg-gray-800 rounded-lg p-4 divide-y divide-gray-700">
                {conversations.map((msg) => (
                  <li key={msg.id} className="flex items-center gap-3 py-2">
                    <img
                      src={msg.sender?.avatar_url || "/file.svg"}
                      alt="avatar"
                      className="w-8 h-8 rounded-full bg-gray-600"
                    />
                    <span className="font-semibold">{msg.sender?.username || "Unknown"}</span>
                    <span className="mx-2 text-gray-500">→</span>
                    <span>{msg.message.slice(0, 40)}{msg.message.length > 40 ? "..." : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <form onSubmit={handleSend} className="flex flex-col md:flex-row gap-2 mb-6 w-full max-w-xs sm:max-w-2xl mx-auto">
          <input
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            value={recipientId}
            onChange={e => setRecipientId(e.target.value)}
            placeholder="Recipient User ID"
          />
          <input
            className="flex-1 p-2 rounded bg-gray-700 text-white"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white font-bold" disabled={!recipientId.trim() || !newMessage.trim()}>Send</button>
        </form>
        {sendStatus && <div className="text-sm text-white bg-black/60 rounded p-2 mb-4">{sendStatus}</div>}
      </main>
    </ErrorBoundary>
  );
}
// TODO: Modularize message list and add E2E tests.
