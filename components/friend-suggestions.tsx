"use client"

import { useEffect, useState } from "react"
import { collection, query, limit, getDocs, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

interface UserSuggestion {
  id: string
  displayName: string
  photoURL?: string
  bio?: string
}

export function FriendSuggestions() {
  const { user } = useAuth()
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    async function fetchSuggestions() {
      if (!user) return

      try {
        // Get current user's friends
        const friendsRef = collection(db, "users", user.uid, "friends")
        const friendsSnapshot = await getDocs(friendsRef)
        const friendIds = new Set<string>()
        friendsSnapshot.forEach((doc) => friendIds.add(doc.id))

        // Get pending friend requests
        const pendingRef = collection(db, "users", user.uid, "pendingFriends")
        const pendingSnapshot = await getDocs(pendingRef)
        const pendingIds = new Set<string>()
        pendingSnapshot.forEach((doc) => pendingIds.add(doc.id))
        setPendingRequests(pendingIds)

        // Get user suggestions
        const usersRef = collection(db, "users")
        const usersQuery = query(usersRef, limit(10))
        const usersSnapshot = await getDocs(usersQuery)

        const suggestionsList: UserSuggestion[] = []
        usersSnapshot.forEach((doc) => {
          const userData = doc.data() as UserSuggestion
          // Don't suggest current user, friends, or pending requests
          if (doc.id !== user.uid && !friendIds.has(doc.id) && !pendingIds.has(doc.id) && suggestionsList.length < 5) {
            suggestionsList.push({
              id: doc.id,
              displayName: userData.displayName,
              photoURL: userData.photoURL,
              bio: userData.bio,
            })
          }
        })

        setSuggestions(suggestionsList)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [user])

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return

    try {
      // Add to current user's pending friends
      await setDoc(doc(db, "users", user.uid, "pendingFriends", friendId), {
        status: "outgoing",
        timestamp: new Date().toISOString(),
      })

      // Add to target user's friend requests
      await setDoc(doc(db, "users", friendId, "friendRequests", user.uid), {
        status: "incoming",
        timestamp: new Date().toISOString(),
        from: {
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      })

      // Update UI
      setPendingRequests((prev) => new Set(prev).add(friendId))

      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send friend request. Please try again.",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>People You May Know</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-[100px]" />
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
        <CardTitle>People You May Know</CardTitle>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-center text-muted-foreground">No suggestions available</p>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={suggestion.photoURL || "/placeholder.svg"} />
                    <AvatarFallback>{suggestion.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{suggestion.displayName}</p>
                    {suggestion.bio && (
                      <p className="text-sm text-muted-foreground truncate max-w-[150px]">{suggestion.bio}</p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={pendingRequests.has(suggestion.id) ? "outline" : "default"}
                  disabled={pendingRequests.has(suggestion.id)}
                  onClick={() => sendFriendRequest(suggestion.id)}
                >
                  {pendingRequests.has(suggestion.id) ? "Pending" : "Add Friend"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
