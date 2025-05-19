"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/utils/supabase-client"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import {
  getStreamChatMessages,
  sendStreamChatMessage,
  subscribeToStreamChat,
  deleteChatMessage,
} from "@/services/stream-service"

export function useStreamChat(streamId: string, isDj = false) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      if (!streamId) return

      try {
        setLoading(true)
        setError(null)

        const chatMessages = await getStreamChatMessages(streamId)

        // Fetch user profiles for messages
        const userIds = [...new Set(chatMessages.map((msg) => msg.user_id))]

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url, username")
            .in("id", userIds)

          // Attach user profiles to messages
          const messagesWithProfiles = chatMessages.map((message) => {
            const userProfile = profiles?.find((profile) => profile.id === message.user_id)
            return {
              ...message,
              user: userProfile || null,
            }
          })

          setMessages(messagesWithProfiles)
        } else {
          setMessages(chatMessages)
        }
      } catch (err) {
        console.error("Error loading chat messages:", err)
        setError("Failed to load chat messages")
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [streamId])

  // Subscribe to new messages
  useEffect(() => {
    if (!streamId) return

    const unsubscribe = subscribeToStreamChat(streamId, async (newMessage) => {
      try {
        // Fetch user profile for the new message
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url, username")
          .eq("id", newMessage.user_id)
          .single()

        setMessages((prev) => [
          ...prev,
          {
            ...newMessage,
            user: userProfile || null,
          },
        ])
      } catch (err) {
        console.error("Error processing new message:", err)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [streamId])

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !streamId || !content.trim()) return

      try {
        setSending(true)
        setError(null)

        await sendStreamChatMessage(streamId, user.uid, content)

        // Message will be added via subscription
      } catch (err) {
        console.error("Error sending message:", err)
        setError("Failed to send message")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to send message",
          variant: "destructive",
        })
      } finally {
        setSending(false)
      }
    },
    [streamId, user, toast],
  )

  // Delete message function (for DJ/moderator)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!user || !streamId || !messageId) return

      try {
        setError(null)

        await deleteChatMessage(messageId, user.uid)

        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? { ...msg, is_deleted: true, content: "[Message deleted]" } : msg)),
        )

        toast({
          title: "Message deleted",
          description: "The message has been removed",
        })
      } catch (err) {
        console.error("Error deleting message:", err)
        setError("Failed to delete message")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete message",
          variant: "destructive",
        })
      }
    },
    [streamId, user, toast],
  )

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    deleteMessage,
    isDj,
  }
}
