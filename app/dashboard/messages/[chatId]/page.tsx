"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Phone, Send, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getMatchById } from "@/services/match-service"
import { getProfileById } from "@/services/profile-service"
import {
  getChatRoomByMatchId,
  getChatMessages,
  sendChatMessage,
  markMessagesAsRead,
  subscribeToMessages,
} from "@/services/chat-service"
import type { MatchChatMessage } from "@/types/database"

export default function ChatPage() {
  const { chatId } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [otherUser, setOtherUser] = useState<any>(null)
  const [messages, setMessages] = useState<MatchChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [chatRoom, setChatRoom] = useState<{ id: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchChatData = async () => {
      if (!user || !chatId) return

      try {
        setLoading(true)

        // Get match details
        const match = await getMatchById(chatId as string)

        if (!match) {
          toast({
            title: "Match not found",
            description: "This conversation doesn't exist or has been deleted.",
            variant: "destructive",
          })
          return
        }

        // Determine the other user's ID
        const otherUserId = match.user1_id === user.uid ? match.user2_id : match.user1_id

        // Get other user's profile
        const profile = await getProfileById(otherUserId)

        if (profile) {
          setOtherUser({
            id: profile.id,
            displayName: `${profile.first_name} ${profile.last_name}`.trim(),
            photoURL: profile.avatar_url,
            online: false, // We'll need to implement online status tracking
          })
        }

        // Get or create chat room
        const room = await getChatRoomByMatchId(match.id)

        if (room) {
          setChatRoom(room)

          // Get messages
          const chatMessages = await getChatMessages(room.id)
          setMessages(chatMessages)

          // Mark messages as read
          await markMessagesAsRead(room.id, user.uid)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching chat data:", error)
        setLoading(false)
      }
    }

    fetchChatData()
  }, [user, chatId, toast])

  useEffect(() => {
    // Subscribe to new messages
    if (chatRoom && user) {
      const unsubscribe = subscribeToMessages(chatRoom.id, (newMessage) => {
        setMessages((prev) => [...prev, newMessage])

        // Mark message as read if it's from the other user
        if (newMessage.sender_id !== user.uid) {
          markMessagesAsRead(chatRoom.id, user.uid)
        }
      })

      return () => unsubscribe()
    }
  }, [chatRoom, user])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !user || !chatRoom) return

    try {
      // Send message
      await sendChatMessage(chatRoom.id, user.uid, newMessage)
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Video call feature coming soon!",
    })
  }

  const handleAudioCall = () => {
    toast({
      title: "Audio Call",
      description: "Audio call feature coming soon!",
    })
  }

  const handleVoiceMessage = () => {
    toast({
      title: "Voice Message",
      description: "Voice message feature coming soon!",
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="h-16 bg-muted animate-pulse rounded mb-4" />
        <div className="flex-1 space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <div className={`h-10 ${i % 2 === 0 ? "w-1/3" : "w-1/2"} bg-muted animate-pulse rounded`} />
              </div>
            ))}
        </div>
        <div className="h-12 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-8">
      <Card className="flex flex-col h-full">
        <CardHeader className="border-b p-4">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={otherUser?.photoURL || "/placeholder.svg"} />
              <AvatarFallback>{otherUser?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle>{otherUser?.displayName}</CardTitle>
              <p className="text-sm text-muted-foreground">{otherUser?.online ? "Online" : "Offline"}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleAudioCall}>
                <Phone className="h-4 w-4" />
                <span className="sr-only">Audio Call</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleVideoCall}>
                <Video className="h-4 w-4" />
                <span className="sr-only">Video Call</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isCurrentUser = message.sender_id === user?.uid

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] ${isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-lg p-3`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Button type="button" variant="outline" size="icon" onClick={handleVoiceMessage}>
              <Mic className="h-4 w-4" />
              <span className="sr-only">Voice Message</span>
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
