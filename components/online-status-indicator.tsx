"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface OnlineStatusIndicatorProps {
  className?: string
  showText?: boolean
  isOnline: boolean
}

export function OnlineStatusIndicator({ className, showText = true, isOnline }: OnlineStatusIndicatorProps) {
  const { lastOnline } = useOnlineStatus()
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
            <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
            {showText && <span className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
