"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Send, Smile, Flag, Trash, Info } from "lucide-react"
import { useStreamChat } from "@/hooks/use-stream-chat"
import { validateData, chatMessageSchema } from "@/utils/validation-utils"
import { isRateLimited, recordRateLimitedAction } from "@/utils/rate-limit-utils"
import { isAuthorized } from "@/utils/auth-utils"
import { supabase } from "@/utils/supabase-client"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StreamChatProps {
  streamId: string
  isDj?: boolean
}

export function StreamChat({ streamId, isDj = false }: StreamChatProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [reportReason, setReportReason] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { messages, loading, error, sendMessage, deleteMessage } = useStreamChat(streamId)

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

    if (!message.trim()) {
      return
    }

    try {
      setIsSubmitting(true)
      setValidationError(null)

      // Validate message content
      const validation = validateData(chatMessageSchema, { content: message })
      if (!validation.success) {
        setValidationError("Invalid message content")
        return
      }

      // Check rate limiting
      const isLimited = await isRateLimited(user.uid, "chat_message")
      if (isLimited) {
        toast({
          title: "Rate limit exceeded",
          description: "You're sending messages too quickly. Please wait a moment.",
          variant: "destructive",
        })
        return
      }

      // Record this action for rate limiting
      await recordRateLimitedAction(user.uid, "chat_message")

      // Send the message
      await sendMessage(message)

      // Clear the input
      setMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native)
    setShowEmojiPicker(false)
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return

    try {
      // Check if user is authorized
      const isAuth = await isAuthorized(user.uid, "chat_message", messageId, "delete")

      if (!isAuth) {
        toast({
          title: "Not authorized",
          description: "You don't have permission to delete this message",
          variant: "destructive",
        })
        return
      }

      await deleteMessage(messageId)

      toast({
        title: "Message deleted",
        description: "The message has been deleted",
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleReportMessage = async () => {
    if (!user || !selectedMessage) return

    try {
      if (!reportReason.trim()) {
        toast({
          title: "Report reason required",
          description: "Please provide a reason for the report",
          variant: "destructive",
        })
        return
      }

      // Create the report
      const { error } = await supabase.from("reports").insert({
        reporter_id: user.uid,
        reported_user_id: selectedMessage.user_id,
        reason: reportReason,
        details: `Message content: ${selectedMessage.content}`,
      })

      if (error) {
        throw new Error("Failed to submit report")
      }

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      })

      setReportDialogOpen(false)
      setReportReason("")
      setSelectedMessage(null)
    } catch (error) {
      console.error("Error reporting message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit report",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading chat...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="pb-3">
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-center text-destructive">Failed to load chat messages</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                <Info className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground">Be the first to send a message!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.profiles?.avatar_url || "/placeholder.svg"} alt={msg.profiles?.username} />
                      <AvatarFallback>
                        {msg.profiles?.first_name?.charAt(0)}
                        {msg.profiles?.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {msg.profiles?.first_name} {msg.profiles?.last_name}
                        </p>
                        {msg.profiles?.user_id === streamId && (
                          <span className="rounded bg-primary px-1 py-0.5 text-xs text-primary-foreground">DJ</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                        <div className="flex-1"></div>
                        <TooltipProvider>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <span className="sr-only">Message actions</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {(isDj || user?.uid === msg.user_id) && (
                                <DropdownMenuItem onClick={() => handleDeleteMessage(msg.id)}>
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                              {user && user.uid !== msg.user_id && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedMessage(msg)
                                    setReportDialogOpen(true)
                                  }}
                                >
                                  <Flag className="mr-2 h-4 w-4" />
                                  Report
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TooltipProvider>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          <CardFooter className="border-t bg-card p-3">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      setValidationError(null)
                    }}
                    disabled={isSubmitting}
                    maxLength={500}
                    className={validationError ? "border-destructive" : ""}
                  />
                  {validationError && <p className="mt-1 text-xs text-destructive">{validationError}</p>}
                  <div className="absolute bottom-0 right-0 top-0 flex items-center pr-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            ref={emojiButtonRef}
                          >
                            <Smile className="h-4 w-4" />
                            <span className="sr-only">Add emoji</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add emoji</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 z-10 mb-2">
                      <Picker
                        data={data}
                        onEmojiSelect={handleEmojiSelect}
                        onClickOutside={(e) => {
                          if (emojiButtonRef.current && !emojiButtonRef.current.contains(e.target as Node)) {
                            setShowEmojiPicker(false)
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button type="submit" size="icon" disabled={isSubmitting || !message.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            ) : (
              <div className="flex w-full flex-col items-center gap-2 rounded-md border border-dashed p-4">
                <p className="text-center text-sm text-muted-foreground">You need to be logged in to send messages</p>
                <Button asChild>
                  <a href="/login">Log In</a>
                </Button>
              </div>
            )}
          </CardFooter>
        </div>
      </CardContent>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Message</DialogTitle>
            <DialogDescription>Report this message for violating our community guidelines</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
              <p className="text-sm font-medium">Message:</p>
              <p className="mt-1 text-sm">{selectedMessage?.content}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                From: {selectedMessage?.profiles?.first_name} {selectedMessage?.profiles?.last_name}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Reason for reporting:</p>
              <Textarea
                placeholder="Please explain why you're reporting this message..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReportMessage}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
