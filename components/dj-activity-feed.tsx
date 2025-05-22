"use client"

import { useState, useEffect } from "react"
import { djActivity } from "@/lib/firebase/realtime-database"
import { formatDistanceToNow } from "date-fns"

interface DjActivityFeedProps {
  djId: string
  limit?: number
}

export default function DjActivityFeed({ djId, limit = 5 }: DjActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!djId) return

    setLoading(true)
    const unsubscribe = djActivity.getRecentActivity(djId, limit, (activityData) => {
      setActivities(activityData)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [djId, limit])

  // Helper function to get activity icon and text
  const getActivityDetails = (activity: any) => {
    switch (activity.type) {
      case "track_change":
        return {
          icon: "🎵",
          text: `Changed track to "${activity.trackName}"`,
        }
      case "room_created":
        return {
          icon: "🏠",
          text: `Created a new room "${activity.roomName}"`,
        }
      case "started_session":
        return {
          icon: "🎧",
          text: "Started a DJ session",
        }
      case "ended_session":
        return {
          icon: "👋",
          text: "Ended their DJ session",
        }
      default:
        return {
          icon: "📝",
          text: "Performed an activity",
        }
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-2 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/4 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity</p>
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const { icon, text } = getActivityDetails(activity)
        const time = activity.timestamp
          ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
          : "recently"

        return (
          <div key={activity.id} className="flex items-start space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-lg">{icon}</div>
            <div>
              <p className="text-sm">{text}</p>
              <p className="text-xs text-muted-foreground">{time}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
