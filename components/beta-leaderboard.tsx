"use client"

import { useState, useEffect } from "react"
import { badgeService } from "@/lib/badge-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrophyIcon, MedalIcon, AwardIcon } from "lucide-react"
import Link from "next/link"

interface LeaderboardEntry {
  userId: string
  displayName: string
  photoURL: string
  points: number
  badges: number
  rank: number
}

interface BetaLeaderboardProps {
  limit?: number
  className?: string
}

export function BetaLeaderboard({ limit = 10, className }: BetaLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true)
      try {
        const data = await badgeService.getLeaderboard(limit)

        // Add rank to each entry
        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

        setLeaderboard(rankedData)
      } catch (error) {
        console.error("Error loading leaderboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLeaderboard()
  }, [limit])

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
          <CardTitle>Beta Leaderboard</CardTitle>
          <CardDescription>Top contributors to the beta program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Beta Leaderboard</CardTitle>
        <CardDescription>Top contributors to the beta program</CardDescription>
      </CardHeader>
      <CardContent>
        {leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.map((entry) => (
              <div key={entry.userId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>
                  <Avatar>
                    <AvatarImage src={entry.photoURL || "/placeholder.svg"} alt={entry.displayName} />
                    <AvatarFallback>{entry.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link href={`/dashboard/profile/${entry.userId}`} className="font-medium hover:underline">
                      {entry.displayName}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{entry.badges} badges</span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-primary">
                  {entry.points} points
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No data available yet.</p>
            <p className="text-sm mt-2">Start participating to appear on the leaderboard!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
