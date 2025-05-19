"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare } from "lucide-react"
import Link from "next/link"

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<any[]>([])
  const [pendingMatches, setPendingMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get all matches where the current user is a participant
        const matchesQuery = query(collection(db, "matches"), where("users", "array-contains", user.uid))

        const matchesSnapshot = await getDocs(matchesQuery)
        const confirmedMatches: any[] = []
        const pendingMatches: any[] = []

        for (const doc of matchesSnapshot.docs) {
          const match = doc.data()
          const otherUserId = match.users.find((id: string) => id !== user.uid)

          if (otherUserId) {
            const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", otherUserId)))

            if (!userDoc.empty) {
              const matchData = {
                id: doc.id,
                ...match,
                otherUser: userDoc.docs[0].data(),
              }

              if (match.status === "confirmed") {
                confirmedMatches.push(matchData)
              } else {
                pendingMatches.push(matchData)
              }
            }
          }
        }

        setMatches(confirmedMatches)
        setPendingMatches(pendingMatches)
      } catch (error) {
        console.error("Error fetching matches:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Your Matches</h2>
        <p className="text-muted-foreground">People you've connected with</p>
      </div>

      <Tabs defaultValue="confirmed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="confirmed">Confirmed Matches</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="confirmed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 bg-muted animate-pulse rounded mb-4" />
                      <div className="flex gap-1">
                        {Array(3)
                          .fill(0)
                          .map((_, j) => (
                            <div key={j} className="h-6 w-16 bg-muted animate-pulse rounded" />
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : matches.length > 0 ? (
              matches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-primary/20 to-primary/10">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={match.otherUser.photoURL || "/placeholder.svg"} />
                        <AvatarFallback>{match.otherUser.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{match.otherUser.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Matched {new Date(match.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.otherUser.interests?.slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="w-full" size="sm" asChild>
                        <Link href={`/dashboard/messages/${match.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Message
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No matches yet. Start exploring to find connections!</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/explore">Explore</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-40 bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 bg-muted animate-pulse rounded mb-4" />
                      <div className="flex gap-1">
                        {Array(3)
                          .fill(0)
                          .map((_, j) => (
                            <div key={j} className="h-6 w-16 bg-muted animate-pulse rounded" />
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : pendingMatches.length > 0 ? (
              pendingMatches.map((match) => (
                <Card key={match.id} className="overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-muted/50 to-muted/30">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="h-24 w-24 border-4 border-background">
                        <AvatarImage src={match.otherUser.photoURL || "/placeholder.svg"} />
                        <AvatarFallback>{match.otherUser.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{match.otherUser.displayName}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Request sent {new Date(match.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.otherUser.interests?.slice(0, 3).map((interest: string) => (
                        <Badge key={interest} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button className="w-full" size="sm" variant="outline" disabled>
                        Pending
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No pending requests. Start exploring to find connections!</p>
                <Button className="mt-4" asChild>
                  <Link href="/dashboard/explore">Explore</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
