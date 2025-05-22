"use client"

import { useRoomPresence } from "@/hooks/use-room-presence"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users } from "lucide-react"

interface RoomPresenceDisplayProps {
  roomId: string
  maxDisplayed?: number
}

export default function RoomPresenceDisplay({ roomId, maxDisplayed = 5 }: RoomPresenceDisplayProps) {
  const { roomUsers, userCount } = useRoomPresence(roomId)

  // Convert users object to array
  const userArray = Object.entries(roomUsers).map(([userId, userData]) => ({
    id: userId,
    ...(userData as any),
  }))

  // Take only the first maxDisplayed users
  const displayedUsers = userArray.slice(0, maxDisplayed)
  const additionalUsers = Math.max(0, userCount - maxDisplayed)

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        <TooltipProvider>
          {displayedUsers.map((user) => (
            <Tooltip key={user.id}>
              <TooltipTrigger asChild>
                <Avatar className="h-8 w-8 border-2 border-background">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.displayName} />
                  ) : (
                    <AvatarFallback>{user.displayName?.charAt(0) || "?"}</AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{user.displayName || "Anonymous"}</p>
              </TooltipContent>
            </Tooltip>
          ))}

          {additionalUsers > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  +{additionalUsers}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{additionalUsers} more listeners</p>
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="mr-1 h-4 w-4" />
        <span>{userCount} listening</span>
      </div>
    </div>
  )
}
