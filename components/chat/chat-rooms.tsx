"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Users, Plus, Search, Lock, Star, Send, Smile, Mic, Video, Phone } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getChatRooms,
  joinChatRoom,
  sendMessage,
  getMessages,
  createChatRoom,
  type ChatRoom,
  type Message,
} from "@/lib/firestore"
import { toast } from "sonner"

export default function ChatRooms() {
  const { user, userData } = useAuth()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Load chat rooms on component mount
  useEffect(() => {
    loadChatRooms()
  }, [])

  // Set up real-time message listener when room is selected
  useEffect(() => {
    if (selectedRoom && user) {
      // Clean up previous listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }

      // Set up new listener for selected room
      const unsubscribe = getMessages(selectedRoom, (newMessages) => {
        setMessages(newMessages)
        scrollToBottom()
      })

      unsubscribeRef.current = unsubscribe

      // Join the room
      joinChatRoom(selectedRoom, user.uid).catch(console.error)
    }

    // Cleanup on unmount or room change
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [selectedRoom, user])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatRooms = async () => {
    try {
      setLoading(true)
      const allRooms = await getChatRooms()
      setRooms(allRooms)

      // Auto-select first public room if none selected
      if (!selectedRoom && allRooms.length > 0) {
        const firstPublicRoom = allRooms.find((room) => room.type === "public")
        if (firstPublicRoom) {
          setSelectedRoom(firstPublicRoom.id)
        }
      }
    } catch (error) {
      console.error("Error loading chat rooms:", error)
      toast.error("Failed to load chat rooms")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedRoom || !user || !userData || sendingMessage) return

    try {
      setSendingMessage(true)

      await sendMessage({
        roomId: selectedRoom,
        senderId: user.uid,
        senderName: userData.displayName || userData.firstName || "Anonymous",
        senderAvatar: userData.photoURL || "",
        text: message.trim(),
        type: "text",
      })

      setMessage("")
      toast.success("Message sent!")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleCreateRoom = async () => {
    if (!user || !userData) return

    try {
      const roomName = prompt("Enter room name:")
      if (!roomName) return

      const roomId = await createChatRoom({
        name: roomName,
        description: `Created by ${userData.displayName}`,
        type: "public",
        createdBy: user.uid,
        members: [user.uid],
      })

      toast.success("Room created successfully!")
      loadChatRooms()
      setSelectedRoom(roomId)
    } catch (error) {
      console.error("Error creating room:", error)
      toast.error("Failed to create room")
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ""

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isMyMessage = (senderId: string) => user?.uid === senderId

  const selectedRoomData = rooms.find((room) => room.id === selectedRoom)

  const roomsByType = {
    public: rooms.filter((room) => room.type === "public"),
    private: rooms.filter((room) => room.type === "private"),
    premium: rooms.filter((room) => room.type === "premium"),
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to access chat rooms</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Live Chat Rooms</h1>
        <Button onClick={handleCreateRoom}>
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Available Rooms</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search rooms..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <Tabs defaultValue="public" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="public">Public</TabsTrigger>
                    <TabsTrigger value="private">Private</TabsTrigger>
                    <TabsTrigger value="premium">Premium</TabsTrigger>
                  </TabsList>

                  <TabsContent value="public" className="space-y-2 mt-4">
                    {roomsByType.public.map((room) => (
                      <div
                        key={room.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoom === room.id ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{room.name}</h4>
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {room.memberCount || 0}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{room.description}</p>
                        {room.lastMessage && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {room.lastMessage.sender}: {room.lastMessage.text}
                          </p>
                        )}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="private" className="space-y-2 mt-4">
                    {roomsByType.private.map((room) => (
                      <div
                        key={room.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoom === room.id ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium flex items-center">
                            <Lock className="h-3 w-3 mr-1" />
                            {room.name}
                          </h4>
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {room.memberCount || 0}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{room.description}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="premium" className="space-y-2 mt-4">
                    {roomsByType.premium.map((room) => (
                      <div
                        key={room.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRoom === room.id ? "bg-purple-50 border-purple-200" : "hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedRoom(room.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {room.name}
                          </h4>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Users className="h-3 w-3 mr-1" />
                            {room.memberCount || 0}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{room.description}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedRoomData ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <span>{selectedRoomData.name}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedRoomData.memberCount || 0} online
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>{selectedRoomData.description}</CardDescription>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-3 ${
                        isMyMessage(msg.senderId) ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            msg.senderAvatar || `/placeholder.svg?height=32&width=32&text=${msg.senderName.charAt(0)}`
                          }
                        />
                        <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 ${isMyMessage(msg.senderId) ? "text-right" : ""}`}>
                        <div
                          className={`flex items-center space-x-2 mb-1 ${
                            isMyMessage(msg.senderId) ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <span className="font-medium text-sm">
                            {isMyMessage(msg.senderId) ? "You" : msg.senderName}
                          </span>
                          <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                        </div>
                        <div
                          className={`inline-block p-2 rounded-lg max-w-xs ${
                            isMyMessage(msg.senderId) ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    className="flex-1"
                    disabled={sendingMessage}
                  />
                  <Button onClick={handleSendMessage} disabled={!message.trim() || sendingMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chat Room</h3>
                <p className="text-gray-500">Choose a room from the list to start chatting</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
