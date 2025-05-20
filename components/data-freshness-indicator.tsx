"use client"

import { AlertCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DataFreshnessIndicatorProps {
  lastUpdated: Date | null
  className?: string
}

export function DataFreshnessIndicator({ lastUpdated, className }: DataFreshnessIndicatorProps) {
  const { isOnline } = useOnlineStatus()

  if (!lastUpdated) return null

  const now = new Date()
  const diffMs = now.getTime() - lastUpdated.getTime()
  const diffMins = Math.round(diffMs / 60000)

  // Determine freshness level
  let status: "fresh" | "stale" | "very-stale" = "fresh"
  if (!isOnline) {
    if (diffMins > 60)
      status = "very-stale" // More than an hour old when offline
    else if (diffMins > 15) status = "stale" // More than 15 minutes old when offline
  } else {
    if (diffMins > 120)
      status = "very-stale" // More than 2 hours old when online
    else if (diffMins > 30) status = "stale" // More than 30 minutes old when online
  }

  const formatLastUpdated = () => {
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center text-xs",
              status === "fresh" && "text-green-600",
              status === "stale" && "text-amber-600",
              status === "very-stale" && "text-red-600",
              className,
            )}
          >
            {status === "fresh" ? <Clock className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            <span>Updated {formatLastUpdated()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {status === "fresh" ? (
            <p>Data is up to date</p>
          ) : status === "stale" ? (
            <p>Data may be outdated{!isOnline ? " (you're offline)" : ""}</p>
          ) : (
            <p>Data is outdated{!isOnline ? " (you're offline)" : ""}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
