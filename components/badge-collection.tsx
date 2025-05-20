"use client"

import { useState } from "react"
import type { Badge } from "@/lib/badge-service"
import { CustomBadge } from "@/components/custom-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge as UIBadge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface BadgeCollectionProps {
  badges: Badge[]
  earnedBadges?: string[]
  showEarnedOnly?: boolean
  onBadgeClick?: (badge: Badge) => void
  className?: string
}

export function BadgeCollection({
  badges,
  earnedBadges = [],
  showEarnedOnly = false,
  onBadgeClick,
  className,
}: BadgeCollectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rarity" | "name" | "points" | "category">("rarity")

  // Get all unique categories from badges
  const categories = ["all", ...Array.from(new Set(badges.map((badge) => badge.category)))]

  // Filter badges based on active category, search query, and earned status
  const filteredBadges = badges.filter((badge) => {
    const matchesCategory = activeCategory === "all" || badge.category === activeCategory
    const matchesSearch =
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesEarned = !showEarnedOnly || earnedBadges.includes(badge.id)

    return matchesCategory && matchesSearch && matchesEarned
  })

  // Sort badges
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name)
    } else if (sortBy === "points") {
      return b.points - a.points
    } else if (sortBy === "category") {
      return a.category.localeCompare(b.category)
    } else {
      // Sort by rarity (default)
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
      return (
        (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
        (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
      )
    }
  })

  // Get category display name
  const getCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className={className}>
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Search badges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rarity">Sort by Rarity</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="points">Sort by Points</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex flex-wrap h-auto">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {getCategoryName(category)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            {sortedBadges.length > 0 ? (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <AnimatePresence>
                    {sortedBadges.map((badge) => {
                      const isEarned = earnedBadges.includes(badge.id)
                      return (
                        <motion.div
                          key={badge.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center"
                        >
                          <CustomBadge
                            badge={badge}
                            size="lg"
                            onClick={() => onBadgeClick && onBadgeClick(badge)}
                            className={!isEarned ? "opacity-50 grayscale" : ""}
                          />
                          <div className="mt-2 text-center">
                            <p className="text-sm font-medium truncate max-w-full">{badge.name}</p>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <UIBadge variant="outline" className="text-xs capitalize">
                                {badge.rarity}
                              </UIBadge>
                              <UIBadge variant="secondary" className="text-xs">
                                {badge.points} pts
                              </UIBadge>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground">No badges found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : showEarnedOnly
                      ? "You haven't earned any badges in this category yet"
                      : "No badges available in this category"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
