"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Volume, VolumeX } from "lucide-react"

interface Participant {
  id: string
  displayName: string
  photoURL?: string
  isSpeaking?: boolean
  joinedAt: string
}

export function VideoRoomParticipants({ roomId }: { roomId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Listen for participants
  useEffect(() => {
    if (!roomId) return

    const participantsRef = collection(db, "rooms", roomId, "participants")
    const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const participantsList: Participant[] = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (data.isActive) {
          participantsList.push({
            id: doc.id,
            displayName: data.displayName,
            photoURL: data.photoURL,
            isSpeaking: false,
            joinedAt: data.joinedAt,
          })
        }
      })

      // Sort by join time
      participantsList.sort((a, b) => {
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
      })

      setParticipants(participantsList)
    })

    return () => unsubscribe()
  }, [roomId])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          <span>{participants.length}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Participants ({participants.length})</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-4">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={participant.photoURL || ""} />
                    <AvatarFallback>{participant.displayName?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{participant.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined{" "}
                      {new Date(participant.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                {participant.isSpeaking ? (
                  <Volume className="h-4 w-4 text-green-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}

            {participants.length === 0 && <p className="text-center text-muted-foreground">No participants yet</p>}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
