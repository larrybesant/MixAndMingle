"use client"

import { useState, useEffect } from "react"
import { type Badge, BADGES, badgeService } from "@/lib/badge-service"
import { CustomBadge } from "@/components/custom-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Award, Users } from "lucide-react"

export function BadgeManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"view" | "edit" | "award">("view")
  const [badgeStats, setBadgeStats] = useState<Record<string, { count: number; lastAwarded: string | null }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [userSearchQuery, setUserSearchQuery] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<Array<{ id: string; name: string; email: string }>>([])

  useEffect(() => {
    const loadBadgeStats = async () => {
      setIsLoading(true)
      try {
        // This would be implemented to fetch badge statistics from Firestore
        // For now, we'll use mock data
        const mockStats: Record<string, { count: number; lastAwarded: string | null }> = {}

        BADGES.forEach((badge) => {
          mockStats[badge.id] = {
            count: Math.floor(Math.random() * 50),
            lastAwarded: Math.random() > 0.3 ? new Date().toISOString() : null,
          }
        })

        setBadgeStats(mockStats)
      } catch (error) {
        console.error("Error loading badge stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBadgeStats()
  }, [])

  const filteredBadges = BADGES.filter(
    (badge) =>
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.rarity.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleBadgeClick = (badge: Badge, mode: "view" | "edit" | "award") => {
    setSelectedBadge(badge)
    setDialogMode(mode)
    setIsDialogOpen(true)
  }

  const handleSearchUsers = async () => {
    if (userSearchQuery.length < 3) return

    try {
      // This would search users in Firestore
      // For now, we'll use mock data
      setUserSearchResults([
        { id: "user1", name: "John Doe", email: "john@example.com" },
        { id: "user2", name: "Jane Smith", email: "jane@example.com" },
        { id: "user3", name: "Bob Johnson", email: "bob@example.com" },
      ])
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const handleAwardBadge = async () => {
    if (!selectedBadge || !selectedUserId) return

    try {
      await badgeService.awardBadge(selectedUserId, selectedBadge.id)
      // Update stats
      setBadgeStats((prev) => ({
        ...prev,
        [selectedBadge.id]: {
          count: (prev[selectedBadge.id]?.count || 0) + 1,
          lastAwarded: new Date().toISOString(),
        },
      }))
      setIsDialogOpen(false)
      setSelectedUserId("")
      setUserSearchQuery("")
      setUserSearchResults([])
    } catch (error) {
      console.error("Error awarding badge:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Badge Management</CardTitle>
              <CardDescription>Manage and award badges to beta testers</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search badges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => (
                <Card key={badge.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center">
                      <CustomBadge badge={badge} size="lg" showTooltip={false} className="mb-3" />
                      <h3 className="font-semibold text-center">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground text-center mt-1 line-clamp-2">{badge.description}</p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{badge.rarity}</span>
                        <span>•</span>
                        <span>{badge.points} pts</span>
                      </div>
                      <div className="w-full mt-3 text-xs text-center">
                        <p>
                          Awarded: <span className="font-medium">{badgeStats[badge.id]?.count || 0} times</span>
                        </p>
                        {badgeStats[badge.id]?.lastAwarded && (
                          <p className="mt-0.5">
                            Last: {new Date(badgeStats[badge.id]?.lastAwarded!).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleBadgeClick(badge, "view")}
                        >
                          <Award className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => handleBadgeClick(badge, "award")}
                        >
                          <Users className="h-4 w-4 mr-1" />
                          Award
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "view" ? "Badge Details" : dialogMode === "edit" ? "Edit Badge" : "Award Badge to User"}
            </DialogTitle>
          </DialogHeader>

          {selectedBadge && dialogMode === "view" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <CustomBadge badge={selectedBadge} size="xl" showTooltip={false} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-semibold">{selectedBadge.name}</h3>
                  <p className="text-muted-foreground mt-1">{selectedBadge.description}</p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <span className="px-2 py-1 bg-muted rounded-md text-xs capitalize">{selectedBadge.rarity}</span>
                    <span className="px-2 py-1 bg-muted rounded-md text-xs">{selectedBadge.points} points</span>
                    <span className="px-2 py-1 bg-muted rounded-md text-xs capitalize">{selectedBadge.category}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <Label>Badge ID</Label>
                  <Input value={selectedBadge.id} readOnly />
                </div>
                <div className="space-y-1">
                  <Label>Icon</Label>
                  <Input value={selectedBadge.icon} readOnly />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Statistics</Label>
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex justify-between">
                    <span>Times Awarded:</span>
                    <span className="font-medium">{badgeStats[selectedBadge.id]?.count || 0}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Last Awarded:</span>
                    <span className="font-medium">
                      {badgeStats[selectedBadge.id]?.lastAwarded
                        ? new Date(badgeStats[selectedBadge.id]?.lastAwarded!).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => handleBadgeClick(selectedBadge, "award")}>Award Badge</Button>
              </DialogFooter>
            </div>
          )}

          {selectedBadge && dialogMode === "award" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CustomBadge badge={selectedBadge} size="md" showTooltip={false} />
                <div>
                  <h3 className="font-semibold">{selectedBadge.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBadge.points} points</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-search">Search User</Label>
                <div className="flex gap-2">
                  <Input
                    id="user-search"
                    placeholder="Search by name or email"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                  />
                  <Button type="button" onClick={handleSearchUsers}>
                    Search
                  </Button>
                </div>
              </div>

              {userSearchResults.length > 0 && (
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <div className="border rounded-md overflow-hidden">
                    {userSearchResults.map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 flex items-center justify-between hover:bg-muted cursor-pointer ${
                          selectedUserId === user.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border ${
                            selectedUserId === user.id ? "bg-primary border-primary" : "border-muted-foreground"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAwardBadge} disabled={!selectedUserId}>
                  Award Badge
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
