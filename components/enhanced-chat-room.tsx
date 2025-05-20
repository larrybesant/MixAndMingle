"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { chatService, type ChatMessage, type ChatRoom } from "@/lib/chat-service"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Send, ImageIcon, Mic, Smile, MoreHorizontal, Users, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"

interface EnhancedChatRoomProps {
  roomId: string
}

export function EnhancedChatRoom({ roomId }: EnhancedChatRoomProps) {
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "audio" | "gif" | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [userPresence, setUserPresence] = useState<Record<string, string>>({})
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomData = await chatService.getRoom(roomId)
        setRoom(roomData)
      } catch (error) {
        console.error("Error fetching room:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chat room. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [roomId, toast])

  // Subscribe to messages
  useEffect(() => {
    if (!roomId) return

    const unsubscribe = chatService.subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages)

      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    })

    return () => unsubscribe()
  }, [roomId])

  // Subscribe to user presence
  useEffect(() => {
    if (!room) return

    const unsubscribe = chatService.subscribeToUserPresence(room.members, (presenceData) => {
      setUserPresence(presenceData)
    })

    return () => unsubscribe()
  }, [room])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!user || !room) return

    try {
      if (mediaFile && mediaType) {
        // Send media message
        await chatService.sendMediaMessage(
          roomId,
          mediaFile,
          mediaType,
          user.uid,
          user.displayName || "User",
          user.photoURL || undefined,
        )

        // Clear media preview
        setMediaPreview(null)
        setMediaFile(null)
        setMediaType(null)
      } else if (newMessage.trim()) {
        // Send text message
        await chatService.sendMessage(roomId, {
          text: newMessage.trim(),
          senderId: user.uid,
          senderName: user.displayName || "User",
          senderPhotoURL: user.photoURL || undefined,
        })

        // Clear input
        setNewMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      })
    }
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (file.type.startsWith("image/")) {
      // Handle image
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      setMediaFile(file)
      setMediaType(file.type.includes("gif") ? "gif" : "image")
    } else if (file.type.startsWith("audio/")) {
      // Handle audio
      setMediaFile(file)
      setMediaType("audio")
      setMediaPreview("audio")
    } else {
      toast({
        variant: "destructive",
        title: "Unsupported file type",
        description: "Please select an image or audio file.",
      })
    }
  }

  // Handle audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const audioFile = new File([audioBlob], "audio-message.webm", { type: "audio/webm" })

        setMediaFile(audioFile)
        setMediaType("audio")
        setMediaPreview("audio")
        setIsRecording(false)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
  }

  // Handle adding emoji to message
  const handleEmojiSelect = (emoji: any) => {
    setNewMessage((prev) => prev + emoji.native)
    setShowEmojiPicker(false)
  }

  // Handle adding reaction to message
  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    try {
      await chatService.addReaction(roomId, messageId, user.uid, emoji)
    } catch (error) {
      console.error("Error adding reaction:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add reaction. Please try again.",
      })
    }
  }

  // Handle removing reaction from message
  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    if (!user) return

    try {
      await chatService.removeReaction(roomId, messageId, user.uid, emoji)
    } catch (error) {
      console.error("Error removing reaction:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove reaction. Please try again.",
      })
    }
  }

  // Handle deleting a message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(roomId, messageId)
      toast({
        title: "Message deleted",
        description: "Your message has been deleted.",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message. Please try again.",
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading chat room...</div>
  }

  if (!room) {
    return <div className="flex items-center justify-center h-full">Chat room not found</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/chat-rooms")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{room.name}</h2>
            <p className="text-sm text-muted-foreground">{room.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Users className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Room Members</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <div className="space-y-4">
                  {room.members.map((memberId) => (
                    <div key={memberId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                              userPresence[memberId] === "online" ? "bg-green-500" : "bg-gray-500"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">User {memberId.substring(0, 6)}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {userPresence[memberId] || "offline"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex ${
                    message.senderId === user?.uid ? "flex-row-reverse" : "flex-row"
                  } items-start gap-2 max-w-[80%]`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.senderPhotoURL || ""} />
                    <AvatarFallback>{message.senderName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>

                  <div>
                    <div
                      className={`flex ${
                        message.senderId === user?.uid ? "justify-end" : "justify-start"
                      } items-center gap-2`}
                    >
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp as any).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="font-medium text-sm">{message.senderName}</span>

                      {message.senderId === user?.uid && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDeleteMessage(message.id)}>
                              Delete Message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div
                      className={`mt-1 p-3 rounded-lg ${
                        message.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {message.isDeleted ? (
                        <span className="italic text-muted-foreground">This message has been deleted</span>
                      ) : message.mediaUrl ? (
                        message.mediaType === "image" || message.mediaType === "gif" ? (
                          <img
                            src={message.mediaUrl || "/placeholder.svg"}
                            alt="Shared image"
                            className="max-w-full rounded-md"
                          />
                        ) : message.mediaType === "audio" ? (
                          <audio controls className="max-w-full">
                            <source src={message.mediaUrl} type="audio/webm" />
                            Your browser does not support the audio element.
                          </audio>
                        ) : (
                          <p>{message.text}</p>
                        )
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(message.reactions).map(
                          ([emoji, userIds]) =>
                            userIds.length > 0 && (
                              <Badge
                                key={emoji}
                                variant="outline"
                                className="flex items-center gap-1 cursor-pointer"
                                onClick={() => {
                                  if (user && userIds.includes(user.uid)) {
                                    handleRemoveReaction(message.id, emoji)
                                  } else {
                                    handleAddReaction(message.id, emoji)
                                  }
                                }}
                              >
                                {emoji} <span>{userIds.length}</span>
                              </Badge>
                            ),
                        )}
                      </div>
                    )}

                    {/* Quick reactions */}
                    <div
                      className={`flex mt-1 gap-1 ${message.senderId === user?.uid ? "justify-end" : "justify-start"}`}
                    >
                      {["👍", "❤️", "😂", "😮", "🎵"].map((emoji) => (
                        <button
                          key={emoji}
                          className="text-xs opacity-70 hover:opacity-100"
                          onClick={() => handleAddReaction(message.id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Media preview */}
      {mediaPreview && (
        <div className="p-4 border-t">
          <div className="flex items-center justify-between bg-muted p-2 rounded-md">
            <div className="flex items-center gap-2">
              {mediaType === "image" || mediaType === "gif" ? (
                <div className="h-16 w-16 rounded-md overflow-hidden">
                  <img src={mediaPreview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  <span>Audio message</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setMediaPreview(null)
                setMediaFile(null)
                setMediaType(null)
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[40px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send Image</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,audio/*"
              className="hidden"
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    className={isRecording ? "text-red-500" : ""}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Hold to Record</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="dark" />
              </PopoverContent>
            </Popover>

            <Button onClick={handleSendMessage} disabled={!newMessage.trim() && !mediaFile}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
