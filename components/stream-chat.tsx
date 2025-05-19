"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Send, AlertCircle, Smile } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useStreamChat } from "@/hooks/use-stream-chat"

interface StreamChatProps {
  streamId: string
  isDj: boolean
}

export function StreamChat({ streamId, isDj }: StreamChatProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, loading, error, sendMessage, retry } = useStreamChat(streamId)

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to send messages",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) return

    try {
      setSending(true)
      await sendMessage(message)
      setMessage("")
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button variant="outline" onClick={retry} className="gap-2">
              <Loader2 className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            <p>No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = user && msg.user_id === user.uid

            return (
              <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.profiles?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {msg.profiles?.first_name?.charAt(0) || msg.profiles?.username?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[75%] ${isCurrentUser ? "order-1" : "order-2"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!isCurrentUser && (
                      <span className="font-medium text-sm">
                        {msg.profiles?.first_name
                          ? `${msg.profiles.first_name} ${msg.profiles.last_name || ""}`
                          : msg.profiles?.username || "Anonymous"}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                  </div>

                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {isCurrentUser && (
                  <Avatar className="h-8 w-8 order-2">
                    <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {user?.user_metadata?.first_name?.charAt(0) || user?.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={!user || sending}
            className="flex-1"
            maxLength={500}
          />
          <Button type="button" variant="ghost" size="icon" disabled={!user || sending} className="flex-shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <Button type="submit" disabled={!user || !message.trim() || sending} className="flex-shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  )
}
