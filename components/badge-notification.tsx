"use client"

import { useState, useEffect } from "react"
import type { Badge } from "@/lib/badge-service"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface BadgeNotificationProps {
  badge: Badge | null
  onClose: () => void
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(!!badge)
  }, [badge])

  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  if (!badge) return null

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

  const Icon = getBadgeIcon(badge.icon)

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case "common":
        return "bg-slate-100 text-slate-800 border-slate-200"
      case "uncommon":
        return "bg-green-50 text-green-800 border-green-200"
      case "rare":
        return "bg-blue-50 text-blue-800 border-blue-200"
      case "epic":
        return "bg-purple-50 text-purple-800 border-purple-200"
      case "legendary":
        return "bg-amber-50 text-amber-800 border-amber-200"
      default:
        return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">New Badge Earned!</DialogTitle>
          <DialogDescription className="text-center">You've unlocked a new achievement</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-6">
          <div className={`p-6 rounded-full mb-4 ${getRarityColor(badge.rarity)} border-2`}>
            <Icon className="h-12 w-12" />
          </div>

          <h3 className="text-xl font-bold mb-2">{badge.name}</h3>
          <p className="text-center text-muted-foreground mb-4">{badge.description}</p>

          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="capitalize">{badge.rarity}</span>
            <span>•</span>
            <span>{badge.points} points</span>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleClose}>Continue</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
