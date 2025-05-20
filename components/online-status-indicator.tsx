"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OnlineStatusIndicatorProps {
  className?: string
  showText?: boolean
}

export function OnlineStatusIndicator({ className, showText = true }: OnlineStatusIndicatorProps) {
  const { isOnline, lastOnline } = useOnlineStatus()
  const [showReconnecting, setShowReconnecting] = useState(false)

  // Show reconnecting state briefly when coming back online
  useEffect(() => {
    if (isOnline) {
      setShowReconnecting(true)
      const timer = setTimeout(() => {
        setShowReconnecting(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  const formatLastOnline = () => {
    if (!lastOnline) return ""

    const now = new Date()
    const diffMs = now.getTime() - lastOnline.getTime()
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 1) return "just now"
    if (diffMins === 1) return "1 minute ago"
    if (diffMins < 60) return `${diffMins} minutes ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 hour ago"
    if (diffHours < 24) return `${diffHours} hours ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "yesterday"
    return `${diffDays} days ago`
  }

  const getTooltipText = () => {
    if (isOnline) {
      return showReconnecting ? "Reconnected to the network" : "You're online"
    }
    return lastOnline ? `Offline (Last online: ${formatLastOnline()})` : "You're offline"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2", className)}>
            {isOnline ? (
              <Badge
                variant="outline"
                className={cn(
                  "bg-green-50 text-green-700 border-green-200",
                  showReconnecting && "bg-yellow-50 text-yellow-700 border-yellow-200",
                )}
              >
                <Wifi className="h-3.5 w-3.5 mr-1" />
                {showText && (showReconnecting ? "Reconnecting..." : "Online")}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <WifiOff className="h-3.5 w-3.5 mr-1" />
                {showText && "Offline"}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
