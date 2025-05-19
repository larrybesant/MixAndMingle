"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface DirectMessage {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  is_read: boolean
  created_at: string
  attachment_url: string | null
  attachment_type: string | null
  is_voice_message: boolean
  sender?: {
    id: string
    username: string
    avatar_url: string | null
  }
  recipient?: {
    id: string
    username: string
    avatar_url: string | null
  }
}

export function useDirectMessaging(recipientId: string) {
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!user || !recipientId) return

    // Fetch initial messages
    const fetchMessages = async () => {
      setIsLoading(true)

      try {
        const { data, error } = await supabase
          .from("direct_messages")
          .select(`
            *,
            sender:sender_id (
              id,
              username,
              avatar_url
            ),
            recipient:recipient_id (
              id,
              username,
              avatar_url
            )
          `)
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`,
          )
          .order("created_at", { ascending: true })

        if (error) {
          throw error
        }

        setMessages(data || [])

        // Mark messages as read
        const unreadMessages = data?.filter((msg) => msg.recipient_id === user.id && !msg.is_read) || []

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map((msg) => supabase.from("direct_messages").update({ is_read: true }).eq("id", msg.id)),
          )
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`dm:${user.id}:${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `or(and(sender_id=eq.${user.id},recipient_id=eq.${recipientId}),and(sender_id=eq.${recipientId},recipient_id=eq.${user.id}))`,
        },
        async (payload) => {
          // Fetch the sender and recipient information
          const [senderResponse, recipientResponse] = await Promise.all([
            supabase.from("profiles").select("id, username, avatar_url").eq("id", payload.new.sender_id).single(),
            supabase.from("profiles").select("id, username, avatar_url").eq("id", payload.new.recipient_id).single(),
          ])

          const newMessage = {
            ...payload.new,
            sender: senderResponse.data,
            recipient: recipientResponse.data,
          } as DirectMessage

          setMessages((prev) => [...prev, newMessage])

          // Mark as read if the user is the recipient
          if (payload.new.recipient_id === user.id) {
            await supabase.from("direct_messages").update({ is_read: true }).eq("id", payload.new.id)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, recipientId, supabase])

  const sendMessage = async (
    content: string,
    options?: {
      attachment_url?: string
      attachment_type?: string
      is_voice_message?: boolean
    },
  ) => {
    if (!user || !recipientId || !content.trim()) return

    try {
      const { error } = await supabase.from("direct_messages").insert([
        {
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          attachment_url: options?.attachment_url || null,
          attachment_type: options?.attachment_type || null,
          is_voice_message: options?.is_voice_message || false,
          is_read: false,
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
