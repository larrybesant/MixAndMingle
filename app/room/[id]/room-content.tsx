"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getFirebaseDatabase } from "@/lib/firebase/firebase-client"
import { ref, onValue, off, set, push, serverTimestamp } from "firebase/database"
import { useAuth } from "@/lib/auth/auth-context"

export default function RoomContent() {
  const { id } = useParams()
  const roomId = Array.isArray(id) ? id[0] : id
  const [room, setRoom] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [messageText, setMessageText] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const { user } = useAuth()

  // Fetch room data
  useEffect(() => {
    if (!roomId) return

    const database = getFirebaseDatabase()
    const roomRef = ref(database, `rooms/${roomId}`)

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setRoom(data)
      }
    })

    return () => {
      off(roomRef)
    }
  }, [roomId])

  // Fetch messages
  useEffect(() => {
    if (!roomId) return

    const database = getFirebaseDatabase()
    const messagesRef = ref(database, `rooms/${roomId}/messages`)

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        setMessages(messageList)
      }
    })

    return () => {
      off(messagesRef)
    }
  }, [roomId])

  // Track online users
  useEffect(() => {
    if (!roomId || !user) return

    const database = getFirebaseDatabase()
    const presenceRef = ref(database, `rooms/${roomId}/presence`)
    const userPresenceRef = ref(database, `rooms/${roomId}/presence/${user.uid}`)

    // Mark user as online
    set(userPresenceRef, {
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      lastActive: serverTimestamp(),
    })

    // Remove user when they disconnect
    set(ref(database, `.info/connected`), true)

    // Listen for online users
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const userList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        setOnlineUsers(userList)
      }
    })

    return () => {
      off(presenceRef)
      set(userPresenceRef, null)
    }
  }, [roomId, user])

  // Send message
  const sendMessage = () => {
    if (!messageText.trim() || !user || !roomId) return

    const database = getFirebaseDatabase()
    const messagesRef = ref(database, `rooms/${roomId}/messages`)

    push(messagesRef, {
      text: messageText,
      userId: user.uid,
      displayName: user.displayName || "Anonymous",
      photoURL: user.photoURL || null,
      timestamp: serverTimestamp(),
    })

    setMessageText("")
  }

  if (!room) {
    return <div>Loading room...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{room.name}</span>
            <span className="text-sm font-normal text-muted-foreground">{onlineUsers.length} online</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Room description */}
            <p className="text-muted-foreground">{room.description}</p>

            {/* Online users */}
            <div>
              <h3 className="text-sm font-medium mb-2">Online Users</h3>
              <div className="flex flex-wrap gap-2">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="border rounded-md p-4 h-80 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.userId === user?.uid ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex ${message.userId === user?.uid ? "flex-row-reverse" : "flex-row"} items-start gap-2`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{message.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${message.userId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <p className="text-sm font-medium">{message.displayName}</p>
                      <p>{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
