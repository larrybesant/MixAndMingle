"use client"

import type { Badge } from "@/lib/badge-service"
import { CustomBadge } from "@/components/custom-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface BadgeDetailProps {
  badge: Badge
  isEarned: boolean
  progress?: number
  earnedByUsers?: Array<{
    id: string
    name: string
    avatar?: string
    earnedAt: string
  }>
  className?: string
}

export function BadgeDetail({ badge, isEarned, progress = 0, earnedByUsers = [], className }: BadgeDetailProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <CustomBadge
            badge={badge}
            size="xl"
            showTooltip={false}
            className={!isEarned ? "opacity-60 grayscale" : ""}
          />
          <div className="flex-1 text-center sm:text-left">
            <CardTitle className="text-2xl">{badge.name}</CardTitle>
            <CardDescription className="mt-1">{badge.description}</CardDescription>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <UIBadge variant="outline" className="capitalize">
                {badge.rarity}
              </UIBadge>
              <UIBadge variant="secondary">{badge.points} points</UIBadge>
              <UIBadge variant="outline" className="capitalize">
                {badge.category}
              </UIBadge>
              {isEarned && badge.dateAwarded && (
                <UIBadge variant="default" className="bg-green-500 hover:bg-green-600">
                  Earned on {new Date(badge.dateAwarded).toLocaleDateString()}
                </UIBadge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!isEarned && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Separator className="my-4" />

        <div>
          <h3 className="text-lg font-semibold mb-3">Recently Earned By</h3>
          {earnedByUsers.length > 0 ? (
            <ScrollArea className="h-[200px]">
              <div className="space-y-3">
                {earnedByUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Earned {new Date(user.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No one has earned this badge yet</p>
              <p className="text-sm mt-1">Be the first to unlock it!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
