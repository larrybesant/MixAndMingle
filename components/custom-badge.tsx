"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Badge } from "@/lib/badge-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface CustomBadgeProps {
  badge: Badge
  size?: "sm" | "md" | "lg" | "xl"
  showTooltip?: boolean
  isNew?: boolean
  onClick?: () => void
  className?: string
}

export function CustomBadge({
  badge,
  size = "md",
  showTooltip = true,
  isNew = false,
  onClick,
  className,
}: CustomBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const getBadgeColors = (rarity: string, category: string) => {
    // Base colors by rarity
    const rarityColors: Record<string, { bg: string; border: string; glow: string }> = {
      common: { bg: "bg-slate-100", border: "border-slate-300", glow: "shadow-slate-200" },
      uncommon: { bg: "bg-emerald-100", border: "border-emerald-300", glow: "shadow-emerald-200" },
      rare: { bg: "bg-blue-100", border: "border-blue-300", glow: "shadow-blue-200" },
      epic: { bg: "bg-purple-100", border: "border-purple-300", glow: "shadow-purple-200" },
      legendary: { bg: "bg-amber-100", border: "border-amber-300", glow: "shadow-amber-200" },
    }

    // Category accent colors
    const categoryAccents: Record<string, string> = {
      feedback: "from-cyan-500",
      testing: "from-green-500",
      social: "from-pink-500",
      technical: "from-indigo-500",
      community: "from-orange-500",
      achievement: "from-violet-500",
    }

    return {
      ...(rarityColors[rarity] || rarityColors.common),
      accent: categoryAccents[category] || "from-gray-500",
    }
  }

  const colors = getBadgeColors(badge.rarity, badge.category)
  const badgeIcon = `/badges/${badge.id}.svg`

  const badgeContent = (
    <motion.div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2",
        colors.bg,
        colors.border,
        sizeClasses[size],
        isHovered && `shadow-lg ${colors.glow}`,
        onClick && "cursor-pointer",
        className,
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Badge background with gradient */}
      <div
        className={cn("absolute inset-0 rounded-full opacity-20 bg-gradient-to-br", colors.accent, "to-transparent")}
      />

      {/* Badge icon */}
      <div className="relative z-10">
        <img src={badgeIcon || "/placeholder.svg"} alt={badge.name} className="w-2/3 h-2/3" />
      </div>

      {/* New indicator */}
      {isNew && (
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <span className="text-white text-[8px] font-bold">NEW</span>
        </motion.div>
      )}

      {/* Rarity indicator for larger badges */}
      {(size === "lg" || size === "xl") && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="px-1.5 py-0.5 bg-black/60 rounded-full text-white text-[8px] uppercase tracking-wider">
            {badge.rarity}
          </div>
        </div>
      )}
    </motion.div>
  )

  if (!showTooltip) {
    return badgeContent
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1.5">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="capitalize text-muted-foreground">{badge.rarity}</span>
              <span className="font-medium">{badge.points} points</span>
            </div>
            {badge.dateAwarded && (
              <p className="text-xs text-muted-foreground">
                Earned: {new Date(badge.dateAwarded).toLocaleDateString()}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
