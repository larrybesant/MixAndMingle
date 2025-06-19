"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientId, setRecipientId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConversations() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data } = await supabase
        .from("messages")
        .select("id, sender_id, receiver_id, message, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setConversations(data || []);
      setLoading(false);
    }
    fetchConversations();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendStatus(null);
    if (!recipientId.trim() || !newMessage.trim()) {
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
      receiver_id: recipientId,
      message: newMessage,
    });
    if (!error) {
      // Insert notification for recipient
      await supabase.from("notifications").insert({
        user_id: recipientId,
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
    <main className="min-h-screen bg-black text-white px-2 sm:px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Messages</h1>
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-gray-400">No messages yet.</div>
      ) : (
        <ul className="space-y-4">
          {conversations.map((msg) => (
            <li key={msg.id} className="bg-gray-800 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{new Date(msg.created_at).toLocaleString()}</div>
              <div className="text-white font-semibold">{msg.sender_id === msg.receiver_id ? "You" : msg.sender_id}:</div>
              <div className="text-white">{msg.message}</div>
            </li>
          ))}
        </ul>
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
  );
}
