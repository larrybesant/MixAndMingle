"use client"

import { useState, useEffect } from "react"
import { badgeService } from "@/lib/badge-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrophyIcon, MedalIcon, AwardIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface BadgeLeaderboardWidgetProps {
  className?: string
}

export function BadgeLeaderboardWidget({ className }: BadgeLeaderboardWidgetProps) {
  const [leaderboard, setLeaderboard] = useState<
    Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>
  >([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true)
      try {
        const data = await badgeService.getBadgeCollectorsLeaderboard(5)
        setLeaderboard(data)
      } catch (error) {
        console.error("Error loading badge leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboard()
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-5 w-5 text-yellow-500" />
      case 2:
        return <MedalIcon className="h-5 w-5 text-gray-400" />
      case 3:
        return <AwardIcon className="h-5 w-5 text-amber-700" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">{rank}</span>
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          Badge Champions
        </CardTitle>
        <CardDescription>Top badge collectors in the beta program</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div key={entry.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                <Avatar>
                  <AvatarImage src={entry.photoURL || "/placeholder.svg"} alt={entry.displayName} />
                  <AvatarFallback>{entry.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Link href={`/dashboard/profile/${entry.userId}`} className="font-medium hover:underline">
                  {entry.displayName}
                </Link>
              </div>
              <Badge variant="secondary" className="text-primary">
                {entry.badgeCount} badges
              </Badge>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p>No badges collected yet.</p>
              <p className="text-sm mt-2">Complete beta tasks to earn badges!</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild size="sm" className="w-full">
          <Link href="/dashboard/beta/badges/leaderboard" className="flex items-center justify-center gap-1">
            View Full Leaderboard
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
