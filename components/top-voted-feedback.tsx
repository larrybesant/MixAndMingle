"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { FeedbackItem } from "@/components/feedback-item"
import { feedbackVotingService, type FeedbackWithVotes } from "@/lib/feedback-voting-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp } from "lucide-react"

interface TopVotedFeedbackProps {
  limit?: number
}

export function TopVotedFeedback({ limit = 3 }: TopVotedFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackWithVotes[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()

  useEffect(() => {
    loadTopFeedback()
  }, [])

  const loadTopFeedback = async () => {
    setLoading(true)
    try {
      const topFeedback = await feedbackVotingService.getTopVotedFeedback(limit)
      setFeedback(topFeedback)
    } catch (error) {
      console.error("Error loading top feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleVoteChange = () => {
    // Reload feedback to get updated vote counts
    loadTopFeedback()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Voted Feedback
        </CardTitle>
        <CardDescription>The most popular feedback from our beta community</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
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
        ) : feedback.length > 0 ? (
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
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No feedback available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
