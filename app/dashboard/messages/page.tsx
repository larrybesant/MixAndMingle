"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import Link from "next/link"

export default function MessagesPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get all chats where the current user is a participant
        const chatsQuery = query(
          collection(db, "chats"),
          where("participants", "array-contains", user.uid),
          orderBy("lastMessageTime", "desc"),
        )

        const chatsSnapshot = await getDocs(chatsQuery)
        const chatsData: any[] = []

        for (const doc of chatsSnapshot.docs) {
          const chat = doc.data()
          const otherUserId = chat.participants.find((id: string) => id !== user.uid)

          if (otherUserId) {
            const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", otherUserId)))

            if (!userDoc.empty) {
              chatsData.push({
                id: doc.id,
                ...chat,
                otherUser: userDoc.docs[0].data(),
              })
            }
          }
        }

        setChats(chatsData)
      } catch (error) {
        console.error("Error fetching chats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChats()
  }, [user])

  const filteredChats = chats.filter((chat) =>
    chat.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Chat with your connections</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search messages..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1">
                    <div className="h-4 w-1/4 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <Link key={chat.id} href={`/dashboard/messages/${chat.id}`}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={chat.otherUser.photoURL || "/placeholder.svg"} />
                      <AvatarFallback>{chat.otherUser.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{chat.otherUser.displayName}</h3>
                        <span className="text-xs text-muted-foreground">
                          {chat.lastMessageTime
                            ? new Date(chat.lastMessageTime.toDate()).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && <Badge className="ml-auto">{chat.unreadCount}</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Connect with people to start chatting!</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/explore">Explore</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
