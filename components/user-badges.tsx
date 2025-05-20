"use client"

import { useState, useEffect } from "react"
import { type Badge as BadgeType, badgeService } from "@/lib/badge-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"

interface UserBadgesProps {
  userId: string
  className?: string
}

export function UserBadges({ userId, className }: UserBadgesProps) {
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  useEffect(() => {
    const loadBadges = async () => {
      if (!userId) return

      setIsLoading(true)
      try {
        const userBadges = await badgeService.getUserBadges(userId)
        setBadges(userBadges)
      } catch (error) {
        console.error("Error loading badges:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBadges()
  }, [userId])

  const categories = [
    { id: "all", name: "All Badges" },
    { id: "feedback", name: "Feedback" },
    { id: "testing", name: "Testing" },
    { id: "social", name: "Social" },
    { id: "technical", name: "Technical" },
    { id: "community", name: "Community" },
    { id: "achievement", name: "Achievements" },
  ]

  const filteredBadges = activeCategory === "all" ? badges : badges.filter((badge) => badge.category === activeCategory)

  const getBadgeIcon = (iconName: string): LucideIcon => {
    return (
      (LucideIcons as any)[
        iconName
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("") as keyof typeof LucideIcons
      ] || LucideIcons.Award
    )
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "bg-slate-200 text-slate-800"
      case "uncommon":
        return "bg-green-100 text-green-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-amber-100 text-amber-800"
      default:
        return "bg-slate-200 text-slate-800"
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-40 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Badges & Achievements</CardTitle>
        <CardDescription>
          You've earned {badges.length} badge{badges.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex flex-wrap">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-0">
            {filteredBadges.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredBadges.map((badge) => {
                  const Icon = getBadgeIcon(badge.icon)
                  return (
                    <TooltipProvider key={badge.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col items-center p-3 border rounded-lg hover:bg-muted/20 cursor-help transition-colors">
                            <div className={`p-3 rounded-full mb-2 ${getRarityColor(badge.rarity)}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                              <div className="font-medium text-sm">{badge.name}</div>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {badge.points} pts
                              </Badge>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-medium">{badge.name}</p>
                            <p className="text-sm">{badge.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Earned: {new Date(badge.dateAwarded || "").toLocaleDateString()}</span>
                              <span className="capitalize">{badge.rarity}</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No badges earned in this category yet.</p>
                <p className="text-sm mt-2">Complete beta tasks and provide feedback to earn badges!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
