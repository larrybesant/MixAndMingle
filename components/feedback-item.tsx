"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, Bug, Lightbulb, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { type FeedbackWithVotes, type VoteType, feedbackVotingService } from "@/lib/feedback-voting-service"
import { useToast } from "@/hooks/use-toast"

interface FeedbackItemProps {
  feedback: FeedbackWithVotes
  currentUserId: string | null
  onVoteChange?: () => void
  showDetails?: boolean
}

export function FeedbackItem({ feedback, currentUserId, onVoteChange, showDetails = false }: FeedbackItemProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState<VoteType | null>(feedback.userVote || null)
  const [upvoteCount, setUpvoteCount] = useState(feedback.upvotes)
  const [downvoteCount, setDownvoteCount] = useState(feedback.downvotes)

  const { toast } = useToast()

  const getTypeIcon = () => {
    switch (feedback.type) {
      case "bug":
        return <Bug className="h-4 w-4" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getTypeBadge = () => {
    switch (feedback.type) {
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

  const getStatusIcon = () => {
    switch (feedback.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = () => {
    switch (feedback.status) {
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

  const handleVote = async (voteType: VoteType) => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to vote on feedback.",
        variant: "destructive",
      })
      return
    }

    if (feedback.userId === currentUserId) {
      toast({
        title: "Cannot vote on your own feedback",
        description: "You cannot vote on feedback that you submitted.",
        variant: "destructive",
      })
      return
    }

    setIsVoting(true)

    try {
      const success = await feedbackVotingService.vote(feedback.id, currentUserId, voteType)

      if (success) {
        // Update local state based on vote action
        if (currentVote === voteType) {
          // Remove vote
          setCurrentVote(null)
          if (voteType === "upvote") {
            setUpvoteCount((prev) => prev - 1)
          } else {
            setDownvoteCount((prev) => prev - 1)
          }
        } else if (currentVote === null) {
          // New vote
          setCurrentVote(voteType)
          if (voteType === "upvote") {
            setUpvoteCount((prev) => prev + 1)
          } else {
            setDownvoteCount((prev) => prev + 1)
          }
        } else {
          // Change vote
          setCurrentVote(voteType)
          if (voteType === "upvote") {
            setUpvoteCount((prev) => prev + 1)
            setDownvoteCount((prev) => prev - 1)
          } else {
            setUpvoteCount((prev) => prev - 1)
            setDownvoteCount((prev) => prev + 1)
          }
        }

        // Notify parent component
        if (onVoteChange) {
          onVoteChange()
        }
      }
    } catch (error) {
      console.error("Error voting:", error)
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVoting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={feedback.userPhotoURL || "/placeholder.svg"} alt={feedback.userName} />
            <AvatarFallback>{getInitials(feedback.userName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{feedback.userName}</span>
                {getTypeBadge()}
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                {getStatusBadge()}
              </div>
            </div>
            <p className={`text-sm ${showDetails ? "whitespace-pre-wrap" : ""}`}>{feedback.content}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <span>{formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 ${currentVote === "upvote" ? "text-green-500" : ""}`}
              onClick={() => handleVote("upvote")}
              disabled={isVoting || feedback.userId === currentUserId}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span>{upvoteCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 ${currentVote === "downvote" ? "text-red-500" : ""}`}
              onClick={() => handleVote("downvote")}
              disabled={isVoting || feedback.userId === currentUserId}
            >
              <ThumbsDown className="h-4 w-4 mr-1" />
              <span>{downvoteCount}</span>
            </Button>
          </div>
        </div>
        {feedback.userId === currentUserId && (
          <span className="text-xs text-muted-foreground">You cannot vote on your own feedback</span>
        )}
      </CardFooter>
    </Card>
  )
}
