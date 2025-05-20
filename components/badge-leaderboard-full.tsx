"use client"

import { useState, useEffect } from "react"
import { type Badge as BadgeType, type BadgeCategory, badgeService } from "@/lib/badge-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CrownIcon, StarIcon, TrophyIcon, MedalIcon, AwardIcon, ChevronRightIcon } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { BADGES } from "@/lib/badges" // Declare the BADGES variable

interface CategoryLeaderboardProps {
  category: BadgeCategory
  title: string
  description: string
  icon: LucideIcon
}

interface RarityData {
  name: string
  color: string
  icon: LucideIcon
}

const rarityData: Record<string, RarityData> = {
  legendary: {
    name: "Legendary",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: CrownIcon,
  },
  epic: {
    name: "Epic",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: StarIcon,
  },
  rare: {
    name: "Rare",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: TrophyIcon,
  },
  uncommon: {
    name: "Uncommon",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: MedalIcon,
  },
  common: {
    name: "Common",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: AwardIcon,
  },
}

const categoryData: Record<BadgeCategory, { title: string; description: string; icon: LucideIcon }> = {
  feedback: {
    title: "Feedback Masters",
    description: "Top testers providing valuable feedback",
    icon: LucideIcons.MessageSquare,
  },
  testing: {
    title: "Testing Champions",
    description: "Leaders in feature testing and bug finding",
    icon: LucideIcons.TestTube,
  },
  social: {
    title: "Social Stars",
    description: "Most socially active beta testers",
    icon: LucideIcons.Users,
  },
  technical: {
    title: "Tech Wizards",
    description: "Technical testing experts",
    icon: LucideIcons.Laptop,
  },
  community: {
    title: "Community Heroes",
    description: "Top contributors to our community",
    icon: LucideIcons.Heart,
  },
  achievement: {
    title: "Achievement Hunters",
    description: "Special achievement collectors",
    icon: LucideIcons.Award,
  },
  challenge: {
    title: "Challenge Titans",
    description: "Daily challenge masters",
    icon: LucideIcons.Target,
  },
}

export function BadgeLeaderboardFull() {
  const [isLoading, setIsLoading] = useState(true)
  const [overallLeaderboard, setOverallLeaderboard] = useState<
    Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>
  >([])
  const [stats, setStats] = useState<{
    totalBadgesAwarded: number
    badgesByCategory: Record<BadgeCategory, number>
    badgesByRarity: Record<string, number>
    mostCommonBadges: Array<{ id: string; name: string; count: number }>
    rarestBadges: Array<{ id: string; name: string; count: number }>
  } | null>(null)
  const [recentBadges, setRecentBadges] = useState<
    Array<{ userId: string; displayName: string; photoURL: string; badge: BadgeType }>
  >([])
  const [categoryLeaders, setCategoryLeaders] = useState<
    Record<BadgeCategory, Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>>
  >({
    feedback: [],
    testing: [],
    social: [],
    technical: [],
    community: [],
    achievement: [],
    challenge: [],
  })
  const [rarityLeaders, setRarityLeaders] = useState<
    Record<string, Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>>
  >({
    legendary: [],
    epic: [],
    rare: [],
    uncommon: [],
    common: [],
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load overall leaderboard
        const leaderboard = await badgeService.getBadgeCollectorsLeaderboard(20)
        setOverallLeaderboard(leaderboard)

        // Load badge statistics
        const badgeStats = await badgeService.getBadgeStatistics()
        setStats(badgeStats)

        // Load recently awarded badges
        const recent = await badgeService.getRecentlyAwardedBadges(8)
        setRecentBadges(recent)

        // Load category leaders
        const categoryData: Record<
          BadgeCategory,
          Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>
        > = {
          feedback: [],
          testing: [],
          social: [],
          technical: [],
          community: [],
          achievement: [],
          challenge: [],
        }

        for (const category of Object.keys(categoryData) as BadgeCategory[]) {
          const leaders = await badgeService.getCategoryLeaders(category, 5)
          categoryData[category] = leaders
        }

        setCategoryLeaders(categoryData)

        // Load rarity leaders
        const rarityData: Record<
          string,
          Array<{ userId: string; displayName: string; photoURL: string; badgeCount: number }>
        > = {
          legendary: [],
          epic: [],
          rare: [],
          uncommon: [],
          common: [],
        }

        for (const rarity of Object.keys(rarityData) as Array<"legendary" | "epic" | "rare" | "uncommon" | "common">) {
          const leaders = await badgeService.getRarityLeaders(rarity, 5)
          rarityData[rarity] = leaders
        }

        setRarityLeaders(rarityData)
      } catch (error) {
        console.error("Error loading badge leaderboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CrownIcon className="h-5 w-5 text-yellow-500" />
              Top Badge Collectors
            </CardTitle>
            <CardDescription>Beta testers with the most badges overall</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overallLeaderboard.slice(0, 10).map((entry, index) => (
                <div key={entry.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8">{getRankIcon(index + 1)}</div>
                    <Avatar>
                      <AvatarImage src={entry.photoURL || "/placeholder.svg"} alt={entry.displayName} />
                      <AvatarFallback>{entry.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/dashboard/profile/${entry.userId}`} className="font-medium hover:underline">
                        {entry.displayName}
                      </Link>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-primary">
                    {entry.badgeCount} badges
                  </Badge>
                </div>
              ))}

              {overallLeaderboard.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No data available yet.</p>
                  <p className="text-sm mt-2">Start collecting badges to appear on the leaderboard!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>Latest badges earned by beta testers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBadges.map((item, index) => {
                const Icon = getBadgeIcon(item.badge.icon)
                const rarity = rarityData[item.badge.rarity] || rarityData.common

                return (
                  <div key={`${item.userId}-${item.badge.id}-${index}`} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${rarity.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.badge.name}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4 mr-1">
                          <AvatarImage src={item.photoURL || "/placeholder.svg"} alt={item.displayName} />
                          <AvatarFallback>{item.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {item.displayName}
                      </div>
                    </div>
                  </div>
                )
              })}

              {recentBadges.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No recent badges yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Badge Statistics</CardTitle>
              <CardDescription>Overview of awarded badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium mb-2">Total Badges Awarded</div>
                  <div className="text-3xl font-bold text-primary">{stats.totalBadgesAwarded}</div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Badges by Rarity</div>
                  <div className="space-y-2">
                    {Object.entries(stats.badgesByRarity)
                      .sort(([, a], [, b]) => b - a)
                      .map(([rarity, count]) => {
                        const rarityInfo = rarityData[rarity]
                        const RarityIcon = rarityInfo?.icon || AwardIcon
                        const percentage = Math.round((count / stats.totalBadgesAwarded) * 100) || 0

                        return (
                          <div key={rarity}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <RarityIcon className="h-3.5 w-3.5" />
                                <span className="text-sm capitalize">{rarity}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <Progress value={percentage} className="h-1.5" />
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Badge Distribution</CardTitle>
              <CardDescription>Badges by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(stats.badgesByCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => {
                    const categoryInfo = categoryData[category as BadgeCategory]
                    const CategoryIcon = categoryInfo?.icon || AwardIcon
                    const percentage = Math.round((count / stats.totalBadgesAwarded) * 100) || 0

                    return (
                      <div key={category} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4 text-primary" />
                          <div className="text-sm font-medium capitalize">{category}</div>
                        </div>
                        <div className="flex items-center justify-between mt-1 mb-1">
                          <div className="text-2xl font-semibold">{count}</div>
                          <span className="text-xs text-muted-foreground">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="categories">
        <TabsList className="mb-4">
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="rarity">By Rarity</TabsTrigger>
          <TabsTrigger value="badges">Common vs. Rare</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(categoryLeaders).map(([category, leaders]) => {
              const categoryInfo = categoryData[category as BadgeCategory]
              const CategoryIcon = categoryInfo?.icon || AwardIcon

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CategoryIcon className="h-5 w-5 text-primary" />
                      {categoryInfo.title}
                    </CardTitle>
                    <CardDescription>{categoryInfo.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {leaders.length > 0 ? (
                        leaders.map((entry, index) => (
                          <div key={entry.userId} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-6">{getRankIcon(index + 1)}</div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={entry.photoURL || "/placeholder.svg"} alt={entry.displayName} />
                                <AvatarFallback>{entry.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <Link href={`/dashboard/profile/${entry.userId}`} className="font-medium hover:underline">
                                {entry.displayName}
                              </Link>
                            </div>
                            <Badge variant="outline">{entry.badgeCount}</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p className="text-sm">No leaders yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="rarity">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(rarityLeaders)
              .sort(([a], [b]) => {
                const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
                return (
                  (rarityOrder[b as keyof typeof rarityOrder] || 0) - (rarityOrder[a as keyof typeof rarityOrder] || 0)
                )
              })
              .map(([rarity, leaders]) => {
                const rarityInfo = rarityData[rarity]
                const RarityIcon = rarityInfo?.icon || AwardIcon

                return (
                  <Card key={rarity}>
                    <CardHeader className={rarityInfo.color.replace("bg-", "bg-opacity-20 bg-")}>
                      <CardTitle className="flex items-center gap-2">
                        <RarityIcon className="h-5 w-5" />
                        {rarityInfo.name} Badge Collectors
                      </CardTitle>
                      <CardDescription>Top collectors of {rarity} badges</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {leaders.length > 0 ? (
                          leaders.map((entry, index) => (
                            <div key={entry.userId} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-6">{getRankIcon(index + 1)}</div>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={entry.photoURL || "/placeholder.svg"} alt={entry.displayName} />
                                  <AvatarFallback>{entry.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <Link
                                  href={`/dashboard/profile/${entry.userId}`}
                                  className="font-medium hover:underline"
                                >
                                  {entry.displayName}
                                </Link>
                              </div>
                              <Badge variant="outline">{entry.badgeCount}</Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p className="text-sm">No {rarityInfo.name.toLowerCase()} badges earned yet</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-primary" />
                    Most Common Badges
                  </CardTitle>
                  <CardDescription>The most frequently earned badges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.mostCommonBadges.map((badge, index) => {
                      // Find the badge in the BADGES array to get more details
                      const badgeInfo = BADGES.find((b) => b.id === badge.id)
                      const Icon = badgeInfo ? getBadgeIcon(badgeInfo.icon) : AwardIcon
                      const rarity = badgeInfo?.rarity || "common"
                      const rarityInfo = rarityData[rarity]

                      return (
                        <div key={badge.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${rarityInfo.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{badge.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {badgeInfo?.category || ""} • {rarity}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {badge.count} {badge.count === 1 ? "user" : "users"}
                          </Badge>
                        </div>
                      )
                    })}

                    {stats.mostCommonBadges.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No badges awarded yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 text-amber-500" />
                    Rarest Badges
                  </CardTitle>
                  <CardDescription>The most exclusive badges earned</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.rarestBadges.map((badge) => {
                      // Find the badge in the BADGES array to get more details
                      const badgeInfo = BADGES.find((b) => b.id === badge.id)
                      const Icon = badgeInfo ? getBadgeIcon(badgeInfo.icon) : AwardIcon
                      const rarity = badgeInfo?.rarity || "common"
                      const rarityInfo = rarityData[rarity]

                      return (
                        <div key={badge.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${rarityInfo.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium">{badge.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">
                                {badgeInfo?.category || ""} • {rarity}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className={badge.count === 1 ? "bg-amber-50" : ""}>
                            {badge.count} {badge.count === 1 ? "user" : "users"}
                          </Badge>
                        </div>
                      )
                    })}

                    {stats.rarestBadges.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <p className="text-sm">No badges awarded yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button asChild variant="outline">
          <Link href="/dashboard/badges" className="flex items-center gap-1">
            View All Badges
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
