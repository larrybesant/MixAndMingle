"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { type RoadmapItem, type RoadmapUpdate, getRoadmapItemById, getRoadmapUpdates } from "@/lib/roadmap-service"
import { format } from "date-fns"
import { CalendarIcon, ArrowLeft, ThumbsUp } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RoadmapItemDetailProps {
  id: string
}

export function RoadmapItemDetail({ id }: RoadmapItemDetailProps) {
  const [roadmapItem, setRoadmapItem] = useState<RoadmapItem | null>(null)
  const [updates, setUpdates] = useState<RoadmapUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedFeedback, setRelatedFeedback] = useState<any[]>([])
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const fetchRoadmapItem = async () => {
      try {
        setLoading(true)
        const item = await getRoadmapItemById(id)
        setRoadmapItem(item)

        const itemUpdates = await getRoadmapUpdates(id)
        setUpdates(itemUpdates)

        // Fetch related feedback for the roadmap item
        const feedback = await fetchRelatedFeedback(item.relatedFeedbackIds)
        setRelatedFeedback(feedback)

        setError(null)
      } catch (err) {
        console.error(`Error fetching roadmap item ${id}:`, err)
        setError("Failed to load roadmap item. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmapItem()
  }, [id])

  const fetchRelatedFeedback = async (feedbackIds: string[]) => {
    // Simulate fetching related feedback
    return feedbackIds.map((id) => ({
      id,
      title: `Feedback ${id}`,
      description: `Description for feedback ${id}`,
      type: "feature",
      votes: 10,
    }))
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      "on-hold": "bg-gray-100 text-gray-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const onVote = () => {
    setHasVoted(true)
    // Simulate voting logic here
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Not set"
    return format(timestamp.toDate(), "PPP")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !roadmapItem) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error || "Roadmap item not found"}</span>
        <div className="mt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/beta/roadmap">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roadmap
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/beta/roadmap">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Roadmap
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{roadmapItem.title}</CardTitle>
              <CardDescription className="mt-2">
                Created {format(roadmapItem.createdAt.toDate(), "PPP")}
                {roadmapItem.updatedAt &&
                  roadmapItem.updatedAt.toDate() > roadmapItem.createdAt.toDate() &&
                  ` • Updated ${format(roadmapItem.updatedAt.toDate(), "PPP")}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(roadmapItem.status)}>{roadmapItem.status.replace("-", " ")}</Badge>
              <Badge className={getCategoryColor(roadmapItem.category)}>{roadmapItem.category.replace("-", " ")}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value="details" onValueChange={() => {}}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="feedback">Related Feedback ({relatedFeedback.length})</TabsTrigger>
              <TabsTrigger value="changelog">Changelog</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="prose max-w-none">
                <p>{roadmapItem.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {roadmapItem.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {roadmapItem.estimatedCompletion && (
                <div className="flex items-center text-sm text-gray-500 mt-4 p-2 bg-gray-50 rounded-md">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Estimated completion: {new Date(roadmapItem.estimatedCompletion).toLocaleDateString()}
                </div>
              )}

              {roadmapItem.assignedTo && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Assigned to:</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{roadmapItem.assignedTo.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{roadmapItem.assignedTo}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              {relatedFeedback.length > 0 ? (
                relatedFeedback.map((feedback) => (
                  <Card key={feedback.id}>
                    <CardHeader className="py-3">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{feedback.title}</CardTitle>
                        <Badge variant="outline">{feedback.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm">{feedback.description}</p>
                    </CardContent>
                    <CardFooter className="py-2 flex justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {feedback.votes} votes
                      </div>
                      <Link href={`/dashboard/beta/feedback/${feedback.id}`}>
                        <Button variant="ghost" size="sm">
                          View Feedback
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No related feedback items</div>
              )}
            </TabsContent>

            <TabsContent value="changelog" className="space-y-4">
              {roadmapItem.changelog && roadmapItem.changelog.length > 0 ? (
                <div className="relative border-l-2 border-gray-200 pl-4 ml-2 space-y-6">
                  {roadmapItem.changelog.map((log, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-[22px] top-0 h-4 w-4 rounded-full bg-primary"></div>
                      <div className="mb-1 text-sm font-medium">{format(log.date.toDate(), "PPP")}</div>
                      <div className="mb-2">{log.description}</div>
                      <Badge className={getStatusColor(log.status)}>{log.status.replace("-", " ")}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No changelog entries</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onVote} className={hasVoted ? "bg-primary/10" : ""}>
              <ThumbsUp className={`h-4 w-4 mr-1 ${hasVoted ? "fill-primary" : ""}`} />
              {hasVoted ? "Voted" : "Vote"} ({roadmapItem.votes})
            </Button>
          </div>

          <div className="flex gap-2">{/* Add share button or other actions here */}</div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default RoadmapItemDetail
