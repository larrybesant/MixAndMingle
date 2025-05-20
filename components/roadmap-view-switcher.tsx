"use client"

import { Button } from "@/components/ui/button"
import { LayoutGrid, List, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function RoadmapViewSwitcher() {
  const pathname = usePathname()

  const isBoard = pathname === "/dashboard/beta/roadmap"
  const isList = pathname === "/dashboard/beta/roadmap/list"
  const isTimeline = pathname === "/dashboard/beta/roadmap/timeline"

  return (
    <div className="flex gap-2">
      <Link href="/dashboard/beta/roadmap">
        <Button variant={isBoard ? "default" : "outline"} size="sm">
          <LayoutGrid className="h-4 w-4 mr-2" />
          Board
        </Button>
      </Link>
      <Link href="/dashboard/beta/roadmap/list">
        <Button variant={isList ? "default" : "outline"} size="sm">
          <List className="h-4 w-4 mr-2" />
          List
        </Button>
      </Link>
      <Link href="/dashboard/beta/roadmap/timeline">
        <Button variant={isTimeline ? "default" : "outline"} size="sm">
          <Clock className="h-4 w-4 mr-2" />
          Timeline
        </Button>
      </Link>
    </div>
  )
}
