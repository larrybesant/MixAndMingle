"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Message {
  id: string
  username: string
  message: string
  timestamp: Date
  type: "message" | "tip" | "reaction"
}

interface ChatRoomProps {
  roomId: string
}

export function ChatRoom({ roomId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [username] = useState(`User${Math.floor(Math.random() * 1000)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Helper to sanitize chat input (remove HTML tags, trim, limit length)
  function sanitizeInput(input: string, maxLength: number = 300): string {
    return input.replace(/<[^>]*>?/gm, "").replace(/\s+/g, " ").trim().slice(0, maxLength)
  }

  // Fetch messages from Supabase on mount
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("id, username, message, timestamp, type")
        .eq("room_id", roomId)
        .order("timestamp", { ascending: true })
      if (!error && data) {
        setMessages(
          data.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        )
      }
    }
    fetchMessages()
  }, [roomId])

  // Subscribe to new messages in real time
  useEffect(() => {
    const channel = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const msg = payload.new
          setMessages((prev) => [
            ...prev,
            {
              id: msg.id,
              username: msg.username,
              message: msg.message,
              timestamp: new Date(msg.timestamp),
              type: msg.type,
            },
          ])
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanMsg = sanitizeInput(newMessage)
    if (!cleanMsg) return
    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      username,
      message: cleanMsg,
      type: "message",
    })
    if (!error) setNewMessage("")
  }

  const sendReaction = async (emoji: string) => {
    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      username,
      message: emoji,
      type: "reaction",
    })
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-xl font-bold text-white">Live Chat</h3>
        <p className="text-gray-400 text-sm">{messages.length} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${
              msg.username === username ? "bg-blue-600/20 border-blue-500/30" : "bg-slate-700/30"
            } rounded-lg p-3 border border-white/10`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-purple-300">{msg.username}</span>
              <span className="text-xs text-gray-400">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
            <p className="text-white text-sm">{msg.message}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reactions */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 mb-3">
          {["🔥", "💜", "🎵", "⚡", "👏", "🙌"].map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              className="text-2xl hover:scale-125 transition-transform duration-200"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-700/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
