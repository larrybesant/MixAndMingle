"use client"

import { useState } from "react"
import type { Badge } from "@/lib/badge-service"
import { CustomBadge } from "@/components/custom-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BadgeDetail } from "@/components/badge-detail"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface BadgeShowcaseProps {
  userId: string
  badges: Badge[]
  displayLimit?: number
  showViewAllButton?: boolean
  className?: string
}

export function BadgeShowcase({
  userId,
  badges,
  displayLimit = 5,
  showViewAllButton = true,
  className,
}: BadgeShowcaseProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Sort badges by rarity and date awarded
  const sortedBadges = [...badges].sort((a, b) => {
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
    const rarityDiff =
      (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
      (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)

    if (rarityDiff !== 0) return rarityDiff

    // If same rarity, sort by date (newest first)
    const dateA = a.dateAwarded ? new Date(a.dateAwarded).getTime() : 0
    const dateB = b.dateAwarded ? new Date(b.dateAwarded).getTime() : 0
    return dateB - dateA
  })

  const displayBadges = sortedBadges.slice(0, displayLimit)
  const hasMoreBadges = badges.length > displayLimit

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Badges & Achievements</CardTitle>
              <CardDescription>
                {badges.length} badge{badges.length !== 1 ? "s" : ""} earned
              </CardDescription>
            </div>
            {showViewAllButton && hasMoreBadges && (
              <Button variant="ghost" size="sm" className="gap-1" asChild>
                <a href={`/dashboard/profile/${userId}/badges`}>
                  View all <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
              {displayBadges.map((badge) => (
                <CustomBadge
                  key={badge.id}
                  badge={badge}
                  size="md"
                  onClick={() => handleBadgeClick(badge)}
                  isNew={
                    badge.dateAwarded
                      ? new Date().getTime() - new Date(badge.dateAwarded).getTime() < 7 * 24 * 60 * 60 * 1000
                      : false
                  }
                />
              ))}
              {hasMoreBadges && (
                <a
                  href={`/dashboard/profile/${userId}/badges`}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  +{badges.length - displayLimit}
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No badges earned yet</p>
              <p className="text-sm mt-1">Complete beta tasks to earn badges!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Badge Details</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <BadgeDetail
              badge={selectedBadge}
              isEarned={true}
              earnedByUsers={
                [
                  // This would be populated from the database in a real implementation
                ]
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
