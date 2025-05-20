"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BugIcon,
  MessageSquareIcon,
  LightbulbIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowRight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { FeedbackWithVotes } from "@/lib/feedback-voting-service"

export function BetaFeedbackList() {
  const [feedback, setFeedback] = useState<FeedbackWithVotes[]>([])
  const [loading, setLoading] = useState(true)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const loadFeedback = async () => {
      if (!user) return

      try {
        const q = query(collection(db, "betaFeedback"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        const feedbackList: FeedbackWithVotes[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          feedbackList.push({
            id: doc.id,
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
          })
        })

        setFeedback(feedbackList)
      } catch (error) {
        console.error("Error loading feedback:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeedback()
  }, [user])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <BugIcon className="h-4 w-4" />
      case "suggestion":
        return <LightbulbIcon className="h-4 w-4" />
      default:
        return <MessageSquareIcon className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <ClockIcon className="h-4 w-4 text-amber-500" />
      case "rejected":
        return <XCircleIcon className="h-4 w-4 text-red-500" />
      case "confirmed":
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />
      default:
        return <ClockIcon className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Completed
          </Badge>
        )
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            In Progress
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Not Implemented
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Confirmed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-muted/20">
            Pending Review
          </Badge>
        )
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "bug":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Bug
          </Badge>
        )
      case "suggestion":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            Suggestion
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
            Feedback
          </Badge>
        )
    }
  }

  const handleViewDetails = (feedbackId: string) => {
    router.push(`/dashboard/beta/feedback/${feedbackId}`)
  }

  if (loading) {
    return <div>Loading feedback...</div>
  }

  if (feedback.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquareIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No feedback submitted yet</h3>
        <p className="text-muted-foreground">
          Your submitted feedback will appear here. Help us improve by sharing your thoughts!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <div key={item.id} className="border border-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getTypeIcon(item.type)}
              <span className="font-medium">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
              {getTypeBadge(item.type)}
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(item.status)}
              {getStatusBadge(item.status)}
            </div>
          </div>
          <p className="text-sm mb-2">{item.content}</p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Submitted on {new Date(item.createdAt).toLocaleDateString()}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {item.upvotes} upvotes • {item.downvotes} downvotes
              </span>
              <Button variant="ghost" size="sm" onClick={() => handleViewDetails(item.id)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
