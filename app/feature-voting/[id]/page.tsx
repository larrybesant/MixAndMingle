"use client"

import type React from "react"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft, Calendar, CheckCircle, Clock, MessageSquare, Share2, ThumbsUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for feature details
const features = [
  {
    id: "FEAT-001",
    title: "Add dark mode toggle for light theme option",
    description:
      "Allow users to switch between dark and light themes based on their preference. This would include a toggle in the user settings and potentially a quick access button in the navigation bar. The light theme should maintain the same design language but with appropriate color adjustments for readability and aesthetics.",
    status: "planned",
    category: "ui",
    votes: 42,
    votingEnds: "2023-06-15T00:00:00Z",
    comments: [
      {
        id: "comment-1",
        author: {
          name: "Alex Johnson",
          email: "alex.j@example.com",
          avatar: "/placeholder.svg",
        },
        content: "This would be great for daytime use when the dark theme can be hard to read in bright light.",
        created: "2023-05-14T10:30:00Z",
        likes: 5,
      },
      {
        id: "comment-2",
        author: {
          name: "Sarah Miller",
          email: "sarah.m@example.com",
          avatar: "/placeholder.svg",
        },
        content:
          "I'd love to see this implemented. Could we also have an option to automatically switch based on time of day?",
        created: "2023-05-14T11:45:00Z",
        likes: 8,
      },
      {
        id: "comment-3",
        author: {
          name: "Dev Team",
          email: "dev@mixmingle.com",
          avatar: "/placeholder.svg",
          isStaff: true,
        },
        content:
          "Thanks for the suggestion! We're planning to implement this in the next release. The auto-switching based on time is a great idea too.",
        created: "2023-05-15T09:15:00Z",
        likes: 3,
      },
    ],
    author: {
      name: "Night Owl",
      email: "night.owl@example.com",
      avatar: "/placeholder.svg",
    },
    created: "2023-05-13T14:20:00Z",
    hasVoted: false,
    roadmapStatus: "Planned for June 2023 release",
  },
  {
    id: "FEAT-002",
    title: "Allow DJs to schedule recurring streams",
    description:
      "Enable DJs to set up weekly or monthly recurring streams without creating each one individually. This would include options for frequency (daily, weekly, monthly), time slots, and end date for the recurring series. The system should also handle timezone differences appropriately.",
    status: "under-review",
    category: "streaming",
    votes: 78,
    votingEnds: "2023-06-20T00:00:00Z",
    comments: [
      {
        id: "comment-1",
        author: {
          name: "DJ Rhythm",
          email: "dj.rhythm@example.com",
          avatar: "/placeholder.svg",
        },
        content:
          "This would save me so much time! I do a weekly Friday night stream and having to create each one manually is tedious.",
        created: "2023-05-13T15:20:00Z",
        likes: 12,
      },
      {
        id: "comment-2",
        author: {
          name: "Music Lover",
          email: "music.lover@example.com",
          avatar: "/placeholder.svg",
        },
        content:
          "As a listener, this would be great too! I could plan my schedule around my favorite DJs' recurring streams.",
        created: "2023-05-14T09:30:00Z",
        likes: 7,
      },
      {
        id: "comment-3",
        author: {
          name: "Dev Team",
          email: "dev@mixmingle.com",
          avatar: "/placeholder.svg",
          isStaff: true,
        },
        content:
          "We're currently evaluating the technical requirements for this feature. It's a popular request that we're taking seriously!",
        created: "2023-05-15T11:45:00Z",
        likes: 5,
      },
    ],
    author: {
      name: "Weekly DJ",
      email: "weekly.dj@example.com",
      avatar: "/placeholder.svg",
    },
    created: "2023-05-12T08:30:00Z",
    hasVoted: true,
    roadmapStatus: "Under review - Q3 2023 consideration",
  },
]

// Helper function to format dates
function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

// Helper function to format relative time
function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return "just now"
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? "s" : ""} ago`
  } else {
    return formatDate(dateString)
  }
}

// Helper function to calculate days remaining
function getDaysRemaining(dateString: string) {
  const endDate = new Date(dateString)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function FeatureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const featureId = params.id as string

  // Find the feature from our mock data
  const feature = features.find((f) => f.id === featureId)

  // State for the feature and new comment
  const [featureData, setFeatureData] = useState(feature)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!featureData) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Feature not found</h1>
        <p className="mb-6">The feature you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/feature-voting">Back to Feature Voting</Link>
        </Button>
      </div>
    )
  }

  // Handle voting
  const handleVote = () => {
    setFeatureData({
      ...featureData,
      votes: featureData.hasVoted ? featureData.votes - 1 : featureData.votes + 1,
      hasVoted: !featureData.hasVoted,
    })

    toast({
      title: featureData.hasVoted ? "Vote removed" : "Vote added",
      description: featureData.hasVoted
        ? `You've removed your vote from "${featureData.title}"`
        : `You've voted for "${featureData.title}"`,
    })
  }

  // Handle comment submission
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newCommentObj = {
        id: `comment-${featureData.comments.length + 1}`,
        author: {
          name: "Current User",
          email: "user@example.com",
          avatar: "/placeholder.svg",
        },
        content: newComment,
        created: new Date().toISOString(),
        likes: 0,
      }

      setFeatureData({
        ...featureData,
        comments: [...featureData.comments, newCommentObj],
      })

      setNewComment("")
      setIsSubmitting(false)

      toast({
        title: "Comment added",
        description: "Your comment has been added to the discussion.",
      })
    }, 1000)
  }

  // Handle comment like
  const handleLikeComment = (commentId: string) => {
    setFeatureData({
      ...featureData,
      comments: featureData.comments.map((comment) =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment,
      ),
    })
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/feature-voting">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feature Voting
        </Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        featureData.status === "planned"
                          ? "border-green-500 text-green-500"
                          : "border-blue-500 text-blue-500"
                      }
                    >
                      {featureData.status === "planned" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {featureData.status.replace("-", " ")}
                    </Badge>
                    <Badge variant="outline" className="border-purple-500 text-purple-500">
                      {featureData.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">{featureData.title}</CardTitle>
                  <CardDescription>
                    Proposed by {featureData.author.name} on {formatDate(featureData.created)}
                  </CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share this feature</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="whitespace-pre-line">{featureData.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Voting ends: {formatDate(featureData.votingEnds)}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{featureData.comments.length} comments</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <ThumbsUp className="h-4 w-4 text-purple-500 mr-1" />
                    <span>{featureData.votes} votes</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {getDaysRemaining(featureData.votingEnds)} days left to vote
                  </div>
                </div>
                <Progress value={(featureData.votes / 150) * 100} className="h-2 bg-gray-800" />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleVote}
                variant={featureData.hasVoted ? "default" : "outline"}
                className={
                  featureData.hasVoted
                    ? "w-full bg-purple-600 hover:bg-purple-700"
                    : "w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                }
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {featureData.hasVoted ? "Voted" : "Vote for this feature"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Discussion ({featureData.comments.length})</CardTitle>
              <CardDescription>Join the conversation about this feature</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {featureData.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium">{comment.author.name}</span>
                        {comment.author.isStaff && <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">Staff</Badge>}
                      </div>
                      <span className="text-xs text-gray-400">{formatRelativeTime(comment.created)}</span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-gray-400 hover:text-gray-300"
                        onClick={() => handleLikeComment(comment.id)}
                      >
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        {comment.likes}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <form onSubmit={handleSubmitComment} className="pt-4">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add your thoughts on this feature..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] bg-gray-800 border-gray-700"
                  />
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Feature Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Status</div>
                <Badge
                  variant="outline"
                  className={
                    featureData.status === "planned"
                      ? "border-green-500 text-green-500"
                      : "border-blue-500 text-blue-500"
                  }
                >
                  {featureData.status === "planned" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <Clock className="h-3 w-3 mr-1" />
                  )}
                  {featureData.status.replace("-", " ")}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Roadmap</div>
                <p className="text-sm text-gray-400">{featureData.roadmapStatus}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Voting Period</div>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Ends {formatDate(featureData.votingEnds)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Category</div>
                <Badge variant="outline" className="border-purple-500 text-purple-500">
                  {featureData.category}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Similar Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {features
                .filter((f) => f.id !== featureData.id && f.category === featureData.category)
                .slice(0, 3)
                .map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3 pb-3 border-b border-gray-800 last:border-0">
                    <Badge
                      variant="outline"
                      className={
                        feature.status === "planned"
                          ? "border-green-500 text-green-500 mt-0.5"
                          : "border-blue-500 text-blue-500 mt-0.5"
                      }
                    >
                      {feature.status === "planned" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                    </Badge>
                    <div>
                      <Link href={`/feature-voting/${feature.id}`} className="font-medium hover:text-blue-400">
                        {feature.title}
                      </Link>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <ThumbsUp className="h-3 w-3 mr-1 text-purple-500" />
                        <span>{feature.votes} votes</span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/feature-voting">View All Features</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Have a New Idea?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">If you have a different feature suggestion, we'd love to hear it!</p>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/feedback?type=feature">Suggest a Feature</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
