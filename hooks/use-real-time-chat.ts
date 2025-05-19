"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  created_at: string
  sender?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export function useRealTimeChat(roomId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!roomId) return

    // Fetch initial messages
    const fetchMessages = async () => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select(`
            *,
            sender:sender_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })

        if (error) {
          throw error
        }

        setMessages(data || [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the sender information
          const { data: sender } = await supabase
            .from("profiles")
            .select("id, username, avatar_url")
            .eq("id", payload.new.sender_id)
            .single()

          const newMessage = {
            ...payload.new,
            sender,
          } as Message

          setMessages((prev) => [...prev, newMessage])
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [roomId, supabase])

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return

    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          room_id: roomId,
          sender_id: user.id,
          content,
        },
      ])

      if (error) {
        throw error
      }
    } catch (err: any) {
      setError(err.message)
    }
  }

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  }
}
