"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"

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

  // Simulate incoming messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        "🔥 This beat is fire!",
        "Love this track! 💜",
        "Can you play some house music?",
        "Greetings from Brazil! 🇧🇷",
        "This is my jam! 🎵",
        "Amazing set! Keep it up! ⚡",
        "What's the name of this song?",
        "The bass is incredible! 🔊",
      ]

      if (Math.random() > 0.7) {
        const randomUser = `DJ_Fan${Math.floor(Math.random() * 100)}`
        const randomMsg = randomMessages[Math.floor(Math.random() * randomMessages.length)]

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            username: randomUser,
            message: randomMsg,
            timestamp: new Date(),
            type: "message",
          },
        ])
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      username,
      message: newMessage,
      timestamp: new Date(),
      type: "message",
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")
  }

  const sendReaction = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      username,
      message: emoji,
      timestamp: new Date(),
      type: "reaction",
    }

    setMessages((prev) => [...prev, message])
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
