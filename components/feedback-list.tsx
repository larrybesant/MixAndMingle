"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { FeedbackItem } from "@/components/feedback-item"
import { feedbackVotingService, type FeedbackWithVotes } from "@/lib/feedback-voting-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface FeedbackListProps {
  initialFeedback?: FeedbackWithVotes[]
  showFilters?: boolean
}

export function FeedbackList({ initialFeedback, showFilters = true }: FeedbackListProps) {
  const [feedback, setFeedback] = useState<FeedbackWithVotes[]>(initialFeedback || [])
  const [loading, setLoading] = useState(!initialFeedback)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_upvoted" | "most_controversial">("newest")
  const [filterType, setFilterType] = useState<"all" | "bug" | "suggestion" | "general">("all")
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in-progress" | "completed" | "rejected" | "confirmed"
  >("all")

  const { user } = useAuth()

  useEffect(() => {
    if (!initialFeedback) {
      loadFeedback()
    }
  }, [initialFeedback, sortBy, filterType, filterStatus])

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const feedbackItems = await feedbackVotingService.getFeedbackWithVotes(
        user?.uid || null,
        sortBy,
        filterType,
        filterStatus,
      )
      setFeedback(feedbackItems)
    } catch (error) {
      console.error("Error loading feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoteChange = () => {
    // Reload feedback to get updated vote counts
    loadFeedback()
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No feedback found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div>
      {showFilters && (
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <Tabs
            defaultValue={filterType}
            onValueChange={(value) => setFilterType(value as any)}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bug">Bugs</TabsTrigger>
              <TabsTrigger value="suggestion">Ideas</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Not Implemented</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="most_upvoted">Most Upvoted</SelectItem>
                <SelectItem value="most_controversial">Most Discussed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {feedback.map((item) => (
          <FeedbackItem
            key={item.id}
            feedback={item}
            currentUserId={user?.uid || null}
            onVoteChange={handleVoteChange}
          />
        ))}
      </div>
    </div>
  )
}
