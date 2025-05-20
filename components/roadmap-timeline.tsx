"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, AlertCircle, PauseCircle, CalendarIcon } from "lucide-react"
import Link from "next/link"
import type { RoadmapItem, RoadmapStatus } from "@/lib/roadmap-service"
import { format, isAfter, isBefore, parseISO, startOfQuarter, endOfQuarter, addQuarters } from "date-fns"

interface RoadmapTimelineProps {
  roadmapItems: RoadmapItem[]
}

export function RoadmapTimeline({ roadmapItems }: RoadmapTimelineProps) {
  const [timeframe, setTimeframe] = useState<"quarters" | "months" | "all">("quarters")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Get the current date and calculate quarters
  const now = new Date()
  const currentQuarter = startOfQuarter(now)
  const nextQuarter = addQuarters(currentQuarter, 1)
  const twoQuartersOut = addQuarters(currentQuarter, 2)
  const threeQuartersOut = addQuarters(currentQuarter, 3)

  // Filter items based on selected filters
  const filteredItems = roadmapItems.filter((item) => {
    // Filter by category
    if (categoryFilter !== "all" && item.category !== categoryFilter) {
      return false
    }

    // Filter by status
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false
    }

    return true
  })

  // Group items by quarter
  const itemsByQuarter = {
    current: filteredItems.filter((item) => {
      if (!item.estimatedCompletion) return false
      const date = parseISO(item.estimatedCompletion)
      return isBefore(date, endOfQuarter(currentQuarter))
    }),
    next: filteredItems.filter((item) => {
      if (!item.estimatedCompletion) return false
      const date = parseISO(item.estimatedCompletion)
      return isAfter(date, currentQuarter) && isBefore(date, endOfQuarter(nextQuarter))
    }),
    twoOut: filteredItems.filter((item) => {
      if (!item.estimatedCompletion) return false
      const date = parseISO(item.estimatedCompletion)
      return isAfter(date, nextQuarter) && isBefore(date, endOfQuarter(twoQuartersOut))
    }),
    threeOut: filteredItems.filter((item) => {
      if (!item.estimatedCompletion) return false
      const date = parseISO(item.estimatedCompletion)
      return isAfter(date, twoQuartersOut) && isBefore(date, endOfQuarter(threeQuartersOut))
    }),
    future: filteredItems.filter((item) => {
      if (!item.estimatedCompletion) return true // Items with no date go to future
      const date = parseISO(item.estimatedCompletion)
      return isAfter(date, endOfQuarter(threeQuartersOut))
    }),
  }

  // Get unique categories from roadmap items
  const categories = ["all", ...new Set(roadmapItems.map((item) => item.category))]

  const getStatusIcon = (status: RoadmapStatus) => {
    switch (status) {
      case "planned":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "in-progress":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      feature: "bg-blue-100 text-blue-800",
      enhancement: "bg-green-100 text-green-800",
      "bug-fix": "bg-red-100 text-red-800",
      performance: "bg-purple-100 text-purple-800",
      "ui-ux": "bg-yellow-100 text-yellow-800",
      infrastructure: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const formatQuarterLabel = (date: Date) => {
    const year = date.getFullYear()
    const quarter = Math.floor(date.getMonth() / 3) + 1
    return `Q${quarter} ${year}`
  }

  const TimelineItem = ({ item }: { item: RoadmapItem }) => (
    <div className="relative flex items-start mb-8 last:mb-0">
      <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
        {getStatusIcon(item.status)}
      </div>
      <div className="ml-10 flex-1">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
              <Badge className={getCategoryColor(item.category)}>{item.category.replace("-", " ")}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              {item.description.length > 120 ? `${item.description.substring(0, 120)}...` : item.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            {item.estimatedCompletion && (
              <div className="flex items-center text-sm text-gray-500">
                <CalendarIcon className="mr-1 h-4 w-4" />
                Target: {format(parseISO(item.estimatedCompletion), "MMM d, yyyy")}
              </div>
            )}
            <div className="mt-3">
              <Link href={`/dashboard/beta/roadmap/${item.id}`}>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const TimelineSection = ({ title, items }: { title: string; items: RoadmapItem[] }) => (
    <div className="mb-12 last:mb-0">
      <h3 className="text-xl font-bold mb-6">{title}</h3>
      <div className="relative border-l-2 border-gray-200 pl-6 ml-3">
        {items.length > 0 ? (
          items.map((item) => <TimelineItem key={item.id} item={item} />)
        ) : (
          <p className="text-gray-500 italic">No items scheduled for this period</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Mix & Mingle Roadmap Timeline</h2>
        <div className="flex flex-wrap gap-3">
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarters">By Quarters</SelectItem>
              <SelectItem value="months">By Months</SelectItem>
              <SelectItem value="all">All Items</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories
                .filter((c) => c !== "all")
                .map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace("-", " ")}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8">
        <TimelineSection
          title={`Current Quarter (${formatQuarterLabel(currentQuarter)})`}
          items={itemsByQuarter.current}
        />
        <TimelineSection title={`Next Quarter (${formatQuarterLabel(nextQuarter)})`} items={itemsByQuarter.next} />
        <TimelineSection title={`Q3 (${formatQuarterLabel(twoQuartersOut)})`} items={itemsByQuarter.twoOut} />
        <TimelineSection title={`Q4 (${formatQuarterLabel(threeQuartersOut)})`} items={itemsByQuarter.threeOut} />
        <TimelineSection title="Future / Unscheduled" items={itemsByQuarter.future} />
      </div>
    </div>
  )
}
