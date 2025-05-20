"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/lib/toast-context" // Updated import path
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase" // Import storage from firebase
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Send, Smile, Paperclip } from "lucide-react"
import { NotificationApi } from "@/lib/client/notification-api"
import { extractMentions } from "@/lib/notification-service"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { EmojiPicker } from "@/components/emoji-picker"

interface Message {
  id: string
  text: string
  userId: string
  userName: string
  userPhotoURL?: string
  timestamp: any
  reactions?: Record<string, string[]>
  mediaUrl?: string
  mediaType?: "image" | "audio" | "gif"
  replyToId?: string
  isDeleted?: boolean
}

interface RoomData {
  id: string
  name: string
  description: string
  isPrivate: boolean
  members: string[]
  createdBy: string
  type: "public" | "private" | "direct"
}

export function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [sending, setSending] = useState(false)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast() // Declare useToast
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const roomRef = doc(db, "rooms", roomId)
        const roomSnap = await getDoc(roomRef)

        if (roomSnap.exists()) {
          setRoomData({ id: roomId, ...roomSnap.data() } as RoomData)
        } else {
          toast({
            variant: "destructive",
            title: "Room not found",
            description: "The chat room you're looking for doesn't exist.",
          })
          router.push("/dashboard/chat-rooms")
        }
      } catch (error) {
        console.error("Error fetching room data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRoomData()
  }, [roomId, router, toast])

  // Subscribe to messages
  useEffect(() => {
    if (!roomId) return

    const messagesRef = collection(db, "rooms", roomId, "messages")
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messageData: Message[] = []
      snapshot.forEach((doc) => {
        messageData.push({
          id: doc.id,
          ...(doc.data() as Omit<Message, "id">),
        })
      })
      setMessages(messageData)
    })

    return () => unsubscribe()
  }, [roomId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Update participant count when joining/leaving
  useEffect(() => {
    if (!user || !roomData) return

    const updateParticipants = async () => {
      const roomRef = doc(db, "rooms", roomId)

      // Increment participant count when joining
      await updateDoc(roomRef, {
        participants: increment(1),
      })

      // Decrement participant count when leaving
      return () => {
        updateDoc(roomRef, {
          participants: increment(-1),
        }).catch(console.error)
      }
    }

    const cleanup = updateParticipants()
    return () => {
      cleanup.then((fn) => fn && fn())
    }
  }, [user, roomId, roomData])

  const joinRoom = async () => {
    if (!user || !roomData) return

    setJoining(true)
    try {
      const roomRef = doc(db, "rooms", roomId)

      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
      })

      // Refresh room data
      const updatedRoomSnap = await getDoc(roomRef)
      setRoomData({ id: roomId, ...updatedRoomSnap.data() } as RoomData)

      toast({
        title: "Joined room",
        description: `You've joined the "${roomData.name}" chat room.`,
      })

      // Notify room creator and members about new join
      if (roomData.createdBy !== user.uid) {
        try {
          await NotificationApi.sendNotification(
            roomData.createdBy,
            "room",
            "New member joined",
            `${user.displayName} joined your room "${roomData.name}"`,
            {
              roomId,
              senderId: user.uid,
              senderName: user.displayName || "User",
            },
            user.photoURL || undefined,
          )
        } catch (error) {
          console.error("Error sending join notification:", error)
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the room. Please try again.",
      })
    } finally {
      setJoining(false)
    }
  }

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || !roomData) return

    setSending(true)
    try {
      // Create message object
      const messageData: Omit<Message, "id"> = {
        text: newMessage.trim(),
        userId: user.uid,
        userName: user.displayName || "User",
        userPhotoURL: user.photoURL || undefined,
        timestamp: serverTimestamp(),
      }

      // Add reply reference if replying
      if (replyTo) {
        messageData.replyToId = replyTo.id
      }

      // Add message to Firestore
      const messagesRef = collection(db, "rooms", roomId, "messages")
      const messageRef = await addDoc(messagesRef, messageData)
      const messageId = messageRef.id

      // Update room's last message
      await updateDoc(doc(db, "rooms", roomId), {
        lastMessage: {
          text: newMessage.trim(),
          senderId: user.uid,
          timestamp: serverTimestamp(),
        },
      })

      // Extract mentions from message
      const mentions = extractMentions(newMessage)

      // Send mention notifications if any
      if (mentions.length > 0) {
        try {
          await NotificationApi.sendMentionNotifications(
            roomId,
            messageId,
            user.uid,
            user.displayName || "User",
            newMessage,
            mentions,
          )
        } catch (error) {
          console.error("Error sending mention notifications:", error)
        }
      }

      // Send message notifications to other room members
      try {
        await NotificationApi.sendChatMessageNotifications(
          roomId,
          messageId,
          user.uid,
          user.displayName || "User",
          newMessage,
          [user.uid, ...mentions], // Exclude sender and mentioned users (they get mention notifications)
        )
      } catch (error) {
        console.error("Error sending chat message notifications:", error)
      }

      // Clear message input and reply state
      setNewMessage("")
      setReplyTo(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  const addReaction = async (messageId: string, emoji: string) => {
    if (!user || !roomData) return

    try {
      const messageRef = doc(db, "rooms", roomId, "messages", messageId)
      const messageDoc = await getDoc(messageRef)

      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as Message
        const reactions = messageData.reactions || {}
        const emojiReactions = reactions[emoji] || []

        // Only add reaction if user hasn't already reacted with this emoji
        if (!emojiReactions.includes(user.uid)) {
          await updateDoc(messageRef, {
            [`reactions.${emoji}`]: arrayUnion(user.uid),
          })

          // Don't notify if user is reacting to their own message
          if (messageData.userId !== user.uid) {
            try {
              await NotificationApi.sendNotification(
                messageData.userId,
                "reaction",
                "New reaction",
                `${user.displayName} reacted with ${emoji} to your message in ${roomData.name}`,
                {
                  roomId,
                  messageId,
                  senderId: user.uid,
                  senderName: user.displayName,
                  reaction: emoji,
                },
                user.photoURL || undefined,
              )
            } catch (error) {
              console.error("Error sending reaction notification:", error)
            }
          }
        } else {
          // Remove reaction if user has already reacted with this emoji
          await updateDoc(messageRef, {
            [`reactions.${emoji}`]: arrayRemove(user.uid),
          })
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reaction. Please try again.",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user || !roomData) return

    const file = e.target.files[0]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
      })
      return
    }

    // Determine media type
    let mediaType: "image" | "audio" | "gif" = "image"
    if (file.type.startsWith("audio/")) {
      mediaType = "audio"
    } else if (file.type === "image/gif") {
      mediaType = "gif"
    }

    setSending(true)
    try {
      // Upload file and send message using chat service
      // This is a placeholder - you would use your actual file upload service
      const storageRef = ref(storage, `chat-media/${roomId}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const mediaUrl = await getDownloadURL(storageRef)

      // Create message with media
      const messageData: Omit<Message, "id"> = {
        userId: user.uid,
        userName: user.displayName || "User",
        userPhotoURL: user.photoURL || undefined,
        timestamp: serverTimestamp(),
        mediaUrl,
        mediaType,
      }

      // Add message to Firestore
      const messagesRef = collection(db, "rooms", roomId, "messages")
      const messageRef = await addDoc(messagesRef, messageData)
      const messageId = messageRef.id

      // Update room's last message
      await updateDoc(doc(db, "rooms", roomId), {
        lastMessage: {
          text: `Shared ${mediaType}`,
          senderId: user.uid,
          timestamp: serverTimestamp(),
        },
      })

      // Send media notifications to other room members
      try {
        await NotificationApi.sendChatMessageNotifications(
          roomId,
          messageId,
          user.uid,
          user.displayName || "User",
          `Shared ${mediaType}`,
          [user.uid], // Exclude sender
        )
      } catch (error) {
        console.error("Error sending media notification:", error)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload file. Please try again.",
      })
      console.error("Error uploading file:", error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <p>Loading chat room...</p>
  }

  if (!roomData) {
    return <p>Chat room not found</p>
  }

  // Check if user is a member of the room
  const isMember = user && roomData.members.includes(user.uid)

  // If the room is private and user is not a member, show join request
  if (roomData.isPrivate && !isMember) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <h2 className="text-2xl font-bold mb-4">{roomData.name}</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          This is a private chat room. You need to join to view and send messages.
        </p>
        <Button onClick={joinRoom} disabled={joining}>
          {joining ? "Joining..." : "Request to Join"}
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="border-b p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/chat-rooms")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-bold">{roomData.name}</h2>
          <p className="text-sm text-muted-foreground">{roomData.description}</p>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">No messages yet. Be the first to send a message!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-4 mb-4 ${message.userId === user?.uid ? "flex-row-reverse" : ""}`}
            >
              <Avatar>
                <AvatarImage src={message.userPhotoURL || ""} />
                <AvatarFallback>{message.userName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className={`space-y-1 max-w-[70%] ${message.userId === user?.uid ? "items-end" : ""}`}>
                <p className={`text-sm font-medium ${message.userId === user?.uid ? "text-right" : ""}`}>
                  {message.userName}
                </p>

                {/* Reply reference */}
                {message.replyToId && (
                  <div className={`text-xs ${message.userId === user?.uid ? "text-right" : ""} text-muted-foreground`}>
                    Replying to: {messages.find((m) => m.id === message.replyToId)?.text.substring(0, 30)}...
                  </div>
                )}

                {/* Message content */}
                <div
                  className={`p-3 rounded-lg ${
                    message.userId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.isDeleted ? (
                    <p className="italic text-muted-foreground">This message has been deleted</p>
                  ) : message.mediaUrl ? (
                    message.mediaType === "image" || message.mediaType === "gif" ? (
                      <img
                        src={message.mediaUrl || "/placeholder.svg"}
                        alt="Shared media"
                        className="max-w-full rounded"
                      />
                    ) : message.mediaType === "audio" ? (
                      <audio controls src={message.mediaUrl} className="max-w-full" />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>

                {/* Timestamp */}
                <p className={`text-xs text-muted-foreground ${message.userId === user?.uid ? "text-right" : ""}`}>
                  {message.timestamp && typeof message.timestamp.toDate === "function"
                    ? message.timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>

                {/* Reactions */}
                {message.reactions && Object.keys(message.reactions).length > 0 && (
                  <div
                    className={`flex flex-wrap gap-1 ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}
                  >
                    {Object.entries(message.reactions).map(
                      ([emoji, users]) =>
                        users.length > 0 && (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className={`px-2 py-1 rounded-full text-xs ${
                              users.includes(user?.uid || "") ? "bg-primary/20" : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            {emoji} {users.length}
                          </button>
                        ),
                    )}
                  </div>
                )}

                {/* Message actions */}
                <div className={`flex gap-2 ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <EmojiPicker onEmojiSelect={(emoji) => addReaction(message.id, emoji)} />
                    </PopoverContent>
                  </Popover>

                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setReplyTo(message)}>
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply indicator */}
      {replyTo && (
        <div className="border-t p-2 bg-muted/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Replying to {replyTo.userName}:</span>
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">{replyTo.text}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setReplyTo(null)}>
            Cancel
          </Button>
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => fileInputRef.current?.click()}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,audio/*"
                className="hidden"
              />
              <Paperclip className="h-5 w-5" />
            </Button>

            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyTo ? `Reply to ${replyTo.userName}...` : "Type your message..."}
              className="min-h-[80px] flex-1"
            />

            <Button className="self-end" onClick={sendMessage} disabled={!newMessage.trim() || sending}>
              {sending ? "Sending..." : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
