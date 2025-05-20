"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatPreview {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: string
  photoURL?: string
}

export function RecentChats() {
  const { user } = useAuth()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const chatsRef = collection(db, "users", user.uid, "chats")
    const chatsQuery = query(chatsRef, orderBy("lastMessageTime", "desc"), limit(5))

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      const chatData: ChatPreview[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        chatData.push({
          id: doc.id,
          name: data.name,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime,
          photoURL: data.photoURL,
        })
      })
      setChats(chatData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Chats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Chats</CardTitle>
      </CardHeader>
      <CardContent>
        {chats.length === 0 ? (
          <p className="text-center text-muted-foreground">No recent chats</p>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/dashboard/chat/${chat.id}`}
                className="flex items-center gap-4 rounded-lg p-2 hover:bg-muted"
              >
                <Avatar>
                  <AvatarImage src={chat.photoURL || "/placeholder.svg"} />
                  <AvatarFallback>{chat.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium leading-none">{chat.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
