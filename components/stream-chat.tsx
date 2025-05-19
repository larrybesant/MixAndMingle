"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Send } from "lucide-react"
import { getStreamChatMessages, sendStreamChatMessage, subscribeToStreamChat } from "@/services/stream-service"
import { formatDistanceToNow } from "date-fns"

interface StreamChatProps {
  streamId: string
  isDj: boolean
}

export function StreamChat({ streamId, isDj }: StreamChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch initial messages and subscribe to new ones
  useEffect(() => {
    let unsubscribe: () => void = () => {}

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const chatMessages = await getStreamChatMessages(streamId)
        setMessages(chatMessages)

        // Subscribe to new messages
        unsubscribe = await subscribeToStreamChat(streamId, async (newMessage) => {
          // Fetch the complete message with user profile
          const updatedMessages = await getStreamChatMessages(streamId)
          setMessages(updatedMessages)
        })
      } catch (error) {
        console.error("Error fetching chat messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    return () => {
      unsubscribe()
    }
  }, [streamId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !newMessage.trim()) return

    try {
      setSending(true)
      await sendStreamChatMessage(streamId, user.uid, newMessage.trim())
      setNewMessage("")
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <p>No messages yet. Be the first to chat!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-2 group">
                <Avatar className="h-8 w-8 mt-0.5">
                  <AvatarImage src={message.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {message.profiles?.first_name?.charAt(0) || message.profiles?.username?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.profiles?.first_name
                        ? `${message.profiles.first_name} ${message.profiles.last_name || ""}`
                        : message.profiles?.username || "Anonymous"}
                    </span>
                    {isDj && message.user_id === user?.uid && (
                      <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-sm">DJ</span>
                    )}
                    <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!user || sending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!user || !newMessage.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
        {!user && <p className="text-xs text-muted-foreground mt-2">You need to be signed in to chat.</p>}
      </div>
    </div>
  )
}
