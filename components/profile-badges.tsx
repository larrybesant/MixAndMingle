"use client"

import { useState, useEffect } from "react"
import { type Badge as BadgeType, badgeService } from "@/lib/badge-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface ProfileBadgesProps {
  userId: string
  limit?: number
  showAll?: boolean
  className?: string
}

export function ProfileBadges({ userId, limit = 5, showAll = false, className }: ProfileBadgesProps) {
  const [badges, setBadges] = useState<BadgeType[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      <div className={`flex items-center h-10 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (badges.length === 0) {
    return null
  }

  // Sort badges by rarity (legendary first)
  const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
  const sortedBadges = [...badges].sort(
    (a, b) =>
      (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
      (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0),
  )

  // Limit the number of badges shown
  const displayBadges = showAll ? sortedBadges : sortedBadges.slice(0, limit)
  const remainingCount = sortedBadges.length - displayBadges.length

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayBadges.map((badge) => {
        const Icon = getBadgeIcon(badge.icon)
        return (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`p-1.5 rounded-full ${getRarityColor(badge.rarity)}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-xs">{badge.description}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}

      {remainingCount > 0 && (
        <div className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">+{remainingCount} more</div>
      )}
    </div>
  )
}
