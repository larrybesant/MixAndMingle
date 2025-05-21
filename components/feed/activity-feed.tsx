"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeartIcon, MessageCircleIcon, RepeatIcon, ShareIcon } from "lucide-react"

// Define activity item types
type ActivityType = "post" | "comment" | "like" | "follow" | "share"

interface ActivityItem {
  id: string
  type: ActivityType
  user: {
    id: string
    name: string
    username: string
    avatar?: string
  }
  content?: string
  timestamp: Date
  likes?: number
  comments?: number
  shares?: number
  hasLiked?: boolean
  hasShared?: boolean
}

// Sample data for the activity feed
const sampleActivities: ActivityItem[] = [
  {
    id: "1",
    type: "post",
    user: {
      id: "user1",
      name: "Alex Johnson",
      username: "alexj",
      avatar: "/letter-a-abstract.png",
    },
    content:
      "Just joined an amazing DJ session in the Electronic Music room! The beats are incredible! 🎧 #MixAndMingle",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    likes: 12,
    comments: 3,
    shares: 2,
    hasLiked: false,
    hasShared: false,
  },
  {
    id: "2",
    type: "like",
    user: {
      id: "user2",
      name: "Samantha Lee",
      username: "samlee",
      avatar: "/abstract-letter-s.png",
    },
    content: 'Samantha liked your comment: "That drop was insane! 🔥"',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    hasLiked: false,
    hasShared: false,
  },
  {
    id: "3",
    type: "follow",
    user: {
      id: "user3",
      name: "Marcus Wilson",
      username: "marcusw",
      avatar: "/letter-m-typography.png",
    },
    content: "Marcus Wilson started following you",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    hasLiked: false,
    hasShared: false,
  },
  {
    id: "4",
    type: "post",
    user: {
      id: "user4",
      name: "DJ Groove",
      username: "djgroove",
      avatar: "/dj-at-turntables.png",
    },
    content: "Going live in 30 minutes with some fresh house tracks! Join me in Room #42! #HouseMusic #LiveMixing",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    likes: 28,
    comments: 7,
    shares: 9,
    hasLiked: true,
    hasShared: false,
  },
]

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

// Activity item component
const ActivityItem = ({ activity }: { activity: ActivityItem }) => {
  const [liked, setLiked] = useState(activity.hasLiked || false)
  const [likesCount, setLikesCount] = useState(activity.likes || 0)
  const [shared, setShared] = useState(activity.hasShared || false)
  const [sharesCount, setSharesCount] = useState(activity.shares || 0)

  const handleLike = () => {
    if (liked) {
      setLikesCount((prev) => Math.max(0, prev - 1))
    } else {
      setLikesCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  const handleShare = () => {
    if (shared) {
      setSharesCount((prev) => Math.max(0, prev - 1))
    } else {
      setSharesCount((prev) => prev + 1)
    }
    setShared(!shared)
  }

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex items-start">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{activity.user.name}</p>
                <p className="text-sm text-gray-500">@{activity.user.username}</p>
              </div>
              <span className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp)}</span>
            </div>
            <p className="mt-2">{activity.content}</p>

            {activity.type === "post" && (
              <div className="flex mt-3 space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center ${liked ? "text-red-500" : ""}`}
                  onClick={handleLike}
                >
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span>{likesCount}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <MessageCircleIcon className="h-4 w-4 mr-1" />
                  <span>{activity.comments}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center ${shared ? "text-green-500" : ""}`}
                  onClick={handleShare}
                >
                  <RepeatIcon className="h-4 w-4 mr-1" />
                  <span>{sharesCount}</span>
                </Button>
                <Button variant="ghost" size="sm" className="flex items-center">
                  <ShareIcon className="h-4 w-4 mr-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main ActivityFeed component with named export
export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>(sampleActivities)
  const [loading, setLoading] = useState(false)

  // Simulate loading more activities
  const loadMoreActivities = () => {
    setLoading(true)
    // Simulate API call delay
    setTimeout(() => {
      const newActivities = [...activities]
      // Add a new activity at the end
      newActivities.push({
        id: `new-${Date.now()}`,
        type: "post",
        user: {
          id: "user5",
          name: "New User",
          username: "newuser",
          avatar: "/abstract-geometric-network.png",
        },
        content: "Just discovered this amazing platform! Can't wait to join some music rooms! #FirstPost",
        timestamp: new Date(),
        likes: 0,
        comments: 0,
        shares: 0,
        hasLiked: false,
        hasShared: false,
      })
      setActivities(newActivities)
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="activity-feed">
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
          <div className="flex justify-center mt-4">
            <Button onClick={loadMoreActivities} disabled={loading} variant="outline">
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Also export as default for flexibility
export default ActivityFeed
