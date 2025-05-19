"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getStreamChatMessages, sendStreamChatMessage, subscribeToStreamChat } from "@/services/stream-service"
import { supabase } from "@/utils/supabase-client" // Declare the supabase variable

interface ChatMessage {
  id: string
  stream_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: {
    id: string
    first_name?: string
    last_name?: string
    avatar_url?: string
    username?: string
  }
}

export function useStreamChat(streamId: string) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedMessages = await getStreamChatMessages(streamId)
      setMessages(fetchedMessages)
    } catch (err) {
      console.error("Error fetching chat messages:", err)
      setError("Failed to load chat messages. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [streamId])

  // Subscribe to new messages
  useEffect(() => {
    fetchMessages()

    // Set up real-time subscription
    let unsubscribe: (() => void) | undefined

    const setupSubscription = async () => {
      try {
        unsubscribe = await subscribeToStreamChat(streamId, async (newMessage) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from("stream_chat_messages")
            .select(
              `
              *,
              profiles(id, first_name, last_name, avatar_url, username)
            `,
            )
            .eq("id", newMessage.id)
            .single()

          if (data) {
            setMessages((prevMessages) => {
              // Check if message already exists
              if (prevMessages.some((msg) => msg.id === data.id)) {
                return prevMessages
              }
              return [...prevMessages, data]
            })
          }
        })
      } catch (err) {
        console.error("Error setting up chat subscription:", err)
      }
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [streamId, fetchMessages])

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user) {
        throw new Error("You must be logged in to send messages")
      }

      if (!content.trim()) {
        throw new Error("Message cannot be empty")
      }

      try {
        await sendStreamChatMessage(streamId, user.uid, content)
      } catch (err) {
        console.error("Error sending message:", err)
        throw err
      }
    },
    [streamId, user],
  )

  // Retry loading messages
  const retry = useCallback(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    retry,
  }
}
