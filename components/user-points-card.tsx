"use client"

import { useState, useEffect } from "react"
import { badgeService } from "@/lib/badge-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StarIcon } from "lucide-react"

interface UserPointsCardProps {
  userId: string
  className?: string
}

export function UserPointsCard({ userId, className }: UserPointsCardProps) {
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPoints = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        const userPoints = await badgeService.getUserPoints(userId)
        setPoints(userPoints)

        // Calculate level based on points
        // Level formula: level = 1 + Math.floor(points / 100)
        const userLevel = 1 + Math.floor(userPoints / 100)
        setLevel(userLevel)

        // Calculate progress to next level
        const pointsForCurrentLevel = (userLevel - 1) * 100
        const pointsForNextLevel = userLevel * 100
        const progressPercentage =
          ((userPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
        setProgress(progressPercentage)
      } catch (error) {
        console.error("Error loading points:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPoints()
  }, [userId])

  const getLevelTitle = (level: number): string => {
    if (level <= 1) return "Newcomer"
    if (level <= 2) return "Explorer"
    if (level <= 3) return "Contributor"
    if (level <= 5) return "Enthusiast"
    if (level <= 7) return "Expert"
    if (level <= 9) return "Master"
    return "Legend"
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <StarIcon className="h-5 w-5 text-primary" />
          Level {level}: {getLevelTitle(level)}
        </CardTitle>
        <CardDescription>{points} total points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-center text-muted-foreground">
            {Math.round(100 - progress)} points until next level
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
