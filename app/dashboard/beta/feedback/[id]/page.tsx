"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FeedbackItem } from "@/components/feedback-item"
import { feedbackVotingService, type FeedbackWithVotes } from "@/lib/feedback-voting-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"

export default function FeedbackDetailPage() {
  const [feedback, setFeedback] = useState<FeedbackWithVotes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const feedbackId = params.id as string

  useEffect(() => {
    loadFeedback()
  }, [feedbackId])

  const loadFeedback = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get feedback document
      const feedbackRef = doc(db, "betaFeedback", feedbackId)
      const feedbackDoc = await getDoc(feedbackRef)

      if (!feedbackDoc.exists()) {
        setError("Feedback not found")
        setLoading(false)
        return
      }

      const data = feedbackDoc.data()

      // Get user's vote if logged in
      let userVote = null
      if (user) {
        userVote = await feedbackVotingService.getUserVote(feedbackId, user.uid)
      }

      // Create feedback object
      const feedbackItem: FeedbackWithVotes = {
        id: feedbackDoc.id,
        userId: data.userId,
        userName: data.userName || "Anonymous",
        userEmail: data.userEmail,
        userPhotoURL: data.userPhotoURL,
        type: data.type,
        content: data.content,
        status: data.status || "pending",
        createdAt: data.createdAt?.toDate() || new Date(),
        upvotes: data.upvotes || 0,
        downvotes: data.downvotes || 0,
        userVote,
      }

      setFeedback(feedbackItem)
    } catch (error) {
      console.error("Error loading feedback:", error)
      setError("Failed to load feedback. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVoteChange = () => {
    // Reload feedback to get updated vote counts
    loadFeedback()
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-[200px]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !feedback) {
    return (
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">{error || "Feedback not found"}</p>
              <Button variant="outline" className="mt-4" onClick={handleBack}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      <Button variant="ghost" className="mb-4" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Feedback
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Feedback Details</CardTitle>
          <CardDescription>View and vote on this feedback item</CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackItem
            feedback={feedback}
            currentUserId={user?.uid || null}
            onVoteChange={handleVoteChange}
            showDetails={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
