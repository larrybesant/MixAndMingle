"use client"

import { useState, useEffect } from "react"
import { dailyChallengeService } from "@/lib/daily-challenge-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrophyIcon, MedalIcon, AwardIcon, FlameIcon, ZapIcon } from "lucide-react"
import Link from "next/link"

interface LeaderboardEntry {
  userId: string
  displayName: string
  photoURL: string
  totalCompleted: number
  currentStreak: number
  totalPoints: number
  rank: number
}

interface ChallengeLeaderboardProps {
  limit?: number
  className?: string
}

export function ChallengeLeaderboard({ limit = 10, className }: ChallengeLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true)
      try {
        const data = await dailyChallengeService.getChallengeLeaderboard(limit)

        // Add rank to each entry
        const rankedData = data.map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }))

        setLeaderboard(rankedData)
      } catch (error) {
        console.error("Error loading challenge leaderboard:", error)
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
          <CardTitle>Challenge Leaderboard</CardTitle>
          <CardDescription>Top challenge completers this month</CardDescription>
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
        <CardTitle>Challenge Leaderboard</CardTitle>
        <CardDescription>Top challenge completers this month</CardDescription>
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
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ZapIcon className="h-3 w-3 text-primary" />
                        {entry.totalCompleted} completed
                      </span>
                      <span className="flex items-center gap-1">
                        <FlameIcon className="h-3 w-3 text-orange-500" />
                        {entry.currentStreak} day streak
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-primary">
                  {entry.totalPoints} points
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No data available yet.</p>
            <p className="text-sm mt-2">Start completing challenges to appear on the leaderboard!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
