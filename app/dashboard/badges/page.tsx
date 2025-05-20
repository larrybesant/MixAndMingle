"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { type Badge, badgeService, BADGES } from "@/lib/badge-service"
import { BadgeCollection } from "@/components/badge-collection"
import { BadgeDetail } from "@/components/badge-detail"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function BadgesPage() {
  const { user } = useAuth()
  const [userBadges, setUserBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const loadBadges = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        const badges = await badgeService.getUserBadges(user.uid)
        setUserBadges(badges)
      } catch (error) {
        console.error("Error loading badges:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBadges()
  }, [user?.uid])

  const earnedBadgeIds = userBadges.map((badge) => badge.id)

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Badges & Achievements</h1>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="earned">Earned ({userBadges.length})</TabsTrigger>
          <TabsTrigger value="unearned">Unearned ({BADGES.length - userBadges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Available Badges</CardTitle>
              <CardDescription>Discover all the badges you can earn as a Mix & Mingle beta tester</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeCollection badges={BADGES} earnedBadges={earnedBadgeIds} onBadgeClick={handleBadgeClick} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earned">
          <Card>
            <CardHeader>
              <CardTitle>Your Earned Badges</CardTitle>
              <CardDescription>Badges you've unlocked through your contributions and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeCollection
                badges={userBadges}
                earnedBadges={earnedBadgeIds}
                onBadgeClick={handleBadgeClick}
                showEarnedOnly
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unearned">
          <Card>
            <CardHeader>
              <CardTitle>Badges to Unlock</CardTitle>
              <CardDescription>Badges you can still earn through your beta testing activities</CardDescription>
            </CardHeader>
            <CardContent>
              <BadgeCollection
                badges={BADGES.filter((badge) => !earnedBadgeIds.includes(badge.id))}
                earnedBadges={earnedBadgeIds}
                onBadgeClick={handleBadgeClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Badge Details</DialogTitle>
          </DialogHeader>
          {selectedBadge && (
            <BadgeDetail
              badge={selectedBadge}
              isEarned={earnedBadgeIds.includes(selectedBadge.id)}
              progress={30} // This would be calculated based on user progress
              earnedByUsers={
                [
                  // This would be populated from the database in a real implementation
                ]
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
