"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Calendar, CheckCircle, Clock, Lightbulb, MessageSquare, Search, ThumbsUp } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// Mock data for feature voting
const features = [
  {
    id: "FEAT-001",
    title: "Add dark mode toggle for light theme option",
    description: "Allow users to switch between dark and light themes based on their preference.",
    status: "planned",
    category: "ui",
    votes: 42,
    votingEnds: "2023-06-15T00:00:00Z",
    comments: 8,
    author: "night.owl@example.com",
    created: "2023-05-13T14:20:00Z",
    hasVoted: false,
  },
  {
    id: "FEAT-002",
    title: "Allow DJs to schedule recurring streams",
    description: "Enable DJs to set up weekly or monthly recurring streams without creating each one individually.",
    status: "under-review",
    category: "streaming",
    votes: 78,
    votingEnds: "2023-06-20T00:00:00Z",
    comments: 12,
    author: "weekly.dj@example.com",
    created: "2023-05-12T08:30:00Z",
    hasVoted: true,
  },
  {
    id: "FEAT-003",
    title: "Implement tipping system for DJs",
    description: "Allow viewers to send tips to DJs during streams to show appreciation for their performance.",
    status: "planned",
    category: "monetization",
    votes: 104,
    votingEnds: "2023-06-25T00:00:00Z",
    comments: 24,
    author: "supporter@example.com",
    created: "2023-05-10T09:15:00Z",
    hasVoted: false,
  },
  {
    id: "FEAT-004",
    title: "Add playlist sharing between users",
    description: "Enable users to share their playlists with friends and on their profiles.",
    status: "under-review",
    category: "social",
    votes: 56,
    votingEnds: "2023-06-18T00:00:00Z",
    comments: 9,
    author: "music.lover@example.com",
    created: "2023-05-11T15:40:00Z",
    hasVoted: true,
  },
  {
    id: "FEAT-005",
    title: "Create mobile app version",
    description: "Develop native mobile apps for iOS and Android for a better mobile experience.",
    status: "planned",
    category: "platform",
    votes: 132,
    votingEnds: "2023-07-01T00:00:00Z",
    comments: 31,
    author: "mobile.fan@example.com",
    created: "2023-05-09T10:10:00Z",
    hasVoted: false,
  },
  {
    id: "FEAT-006",
    title: "Add audio visualizer for streams",
    description: "Show a visual representation of the audio during DJ streams.",
    status: "under-review",
    category: "streaming",
    votes: 67,
    votingEnds: "2023-06-22T00:00:00Z",
    comments: 14,
    author: "visual.dj@example.com",
    created: "2023-05-08T11:25:00Z",
    hasVoted: false,
  },
  {
    id: "FEAT-007",
    title: "Implement friend recommendations",
    description: "Suggest new friends based on music taste and event attendance.",
    status: "planned",
    category: "social",
    votes: 48,
    votingEnds: "2023-06-19T00:00:00Z",
    comments: 7,
    author: "social.butterfly@example.com",
    created: "2023-05-07T09:30:00Z",
    hasVoted: true,
  },
  {
    id: "FEAT-008",
    title: "Add stream recording and playback",
    description: "Allow DJs to record their streams and make them available for later playback.",
    status: "under-review",
    category: "streaming",
    votes: 91,
    votingEnds: "2023-06-28T00:00:00Z",
    comments: 19,
    author: "replay.fan@example.com",
    created: "2023-05-06T14:15:00Z",
    hasVoted: false,
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

// Helper function to calculate days remaining
function getDaysRemaining(dateString: string) {
  const endDate = new Date(dateString)
  const today = new Date()
  const diffTime = endDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function FeatureVotingPage() {
  const [featuresData, setFeaturesData] = useState(features)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("votes")
  const { toast } = useToast()

  // Filter features based on search query and filters
  const filteredFeatures = featuresData.filter((feature) => {
    const matchesSearch =
      feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || feature.category === categoryFilter
    const matchesStatus = statusFilter === "all" || feature.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Sort features
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (sortBy === "votes") return b.votes - a.votes
    if (sortBy === "newest") return new Date(b.created).getTime() - new Date(a.created).getTime()
    if (sortBy === "ending-soon") return getDaysRemaining(a.votingEnds) - getDaysRemaining(b.votingEnds)
    return 0
  })

  // Handle voting
  const handleVote = (featureId: string) => {
    setFeaturesData(
      featuresData.map((feature) => {
        if (feature.id === featureId) {
          const newVotes = feature.hasVoted ? feature.votes - 1 : feature.votes + 1
          return {
            ...feature,
            votes: newVotes,
            hasVoted: !feature.hasVoted,
          }
        }
        return feature
      }),
    )

    const feature = featuresData.find((f) => f.id === featureId)
    if (feature) {
      toast({
        title: feature.hasVoted ? "Vote removed" : "Vote added",
        description: feature.hasVoted
          ? `You've removed your vote from "${feature.title}"`
          : `You've voted for "${feature.title}"`,
      })
    }
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Feature Voting</h1>
          <p className="text-gray-400">Vote for the features you want to see in MIX & MINGLE</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/feedback?type=feature">Suggest Feature</Link>
          </Button>
          <Button asChild>
            <Link href="/beta-guide">Beta Guide</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle>Top Requested Features</CardTitle>
            <CardDescription>The most popular feature requests from our community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {features
                .sort((a, b) => b.votes - a.votes)
                .slice(0, 3)
                .map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                      <span className="font-bold text-sm">{index + 1}</span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="font-medium">{feature.title}</h3>
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 text-purple-500 mr-1" />
                          <span>{feature.votes}</span>
                        </div>
                      </div>
                      <Progress value={(feature.votes / 150) * 100} className="h-2 bg-gray-800" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
                All Features
              </TabsTrigger>
              <TabsTrigger value="planned" className="data-[state=active]:bg-gray-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Planned
              </TabsTrigger>
              <TabsTrigger value="under-review" className="data-[state=active]:bg-gray-700">
                <Clock className="h-4 w-4 mr-2" />
                Under Review
              </TabsTrigger>
              <TabsTrigger value="my-votes" className="data-[state=active]:bg-gray-700">
                <ThumbsUp className="h-4 w-4 mr-2" />
                My Votes
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search features..."
                  className="pl-8 bg-gray-800 border-gray-700 w-[200px] md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ui">UI/UX</SelectItem>
                  <SelectItem value="streaming">Streaming</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="monetization">Monetization</SelectItem>
                  <SelectItem value="platform">Platform</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="votes">Most Votes</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedFeatures.map((feature) => (
                <Card key={feature.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge
                        variant="outline"
                        className={
                          feature.status === "planned"
                            ? "border-green-500 text-green-500"
                            : "border-blue-500 text-blue-500"
                        }
                      >
                        {feature.status === "planned" ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {feature.status.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline" className="border-purple-500 text-purple-500">
                        {feature.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      <Link href={`/feature-voting/${feature.id}`} className="hover:text-blue-400">
                        {feature.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Ends: {formatDate(feature.votingEnds)}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{feature.comments}</span>
                      </div>
                    </div>
                    <Progress value={(feature.votes / 150) * 100} className="h-2 bg-gray-800" />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 text-purple-500 mr-1" />
                        <span>{feature.votes} votes</span>
                      </div>
                      <div className="text-sm text-gray-400">{getDaysRemaining(feature.votingEnds)} days left</div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleVote(feature.id)}
                      variant={feature.hasVoted ? "default" : "outline"}
                      className={
                        feature.hasVoted
                          ? "w-full bg-purple-600 hover:bg-purple-700"
                          : "w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                      }
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {feature.hasVoted ? "Voted" : "Vote"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="planned" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedFeatures
                .filter((feature) => feature.status === "planned")
                .map((feature) => (
                  <Card key={feature.id} className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          planned
                        </Badge>
                        <Badge variant="outline" className="border-purple-500 text-purple-500">
                          {feature.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">
                        <Link href={`/feature-voting/${feature.id}`} className="hover:text-blue-400">
                          {feature.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Ends: {formatDate(feature.votingEnds)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{feature.comments}</span>
                        </div>
                      </div>
                      <Progress value={(feature.votes / 150) * 100} className="h-2 bg-gray-800" />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 text-purple-500 mr-1" />
                          <span>{feature.votes} votes</span>
                        </div>
                        <div className="text-sm text-gray-400">{getDaysRemaining(feature.votingEnds)} days left</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleVote(feature.id)}
                        variant={feature.hasVoted ? "default" : "outline"}
                        className={
                          feature.hasVoted
                            ? "w-full bg-purple-600 hover:bg-purple-700"
                            : "w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                        }
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {feature.hasVoted ? "Voted" : "Vote"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="under-review" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedFeatures
                .filter((feature) => feature.status === "under-review")
                .map((feature) => (
                  <Card key={feature.id} className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          <Clock className="h-3 w-3 mr-1" />
                          under review
                        </Badge>
                        <Badge variant="outline" className="border-purple-500 text-purple-500">
                          {feature.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">
                        <Link href={`/feature-voting/${feature.id}`} className="hover:text-blue-400">
                          {feature.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Ends: {formatDate(feature.votingEnds)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{feature.comments}</span>
                        </div>
                      </div>
                      <Progress value={(feature.votes / 150) * 100} className="h-2 bg-gray-800" />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 text-purple-500 mr-1" />
                          <span>{feature.votes} votes</span>
                        </div>
                        <div className="text-sm text-gray-400">{getDaysRemaining(feature.votingEnds)} days left</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleVote(feature.id)}
                        variant={feature.hasVoted ? "default" : "outline"}
                        className={
                          feature.hasVoted
                            ? "w-full bg-purple-600 hover:bg-purple-700"
                            : "w-full border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
                        }
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        {feature.hasVoted ? "Voted" : "Vote"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="my-votes" className="mt-0">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedFeatures
                .filter((feature) => feature.hasVoted)
                .map((feature) => (
                  <Card key={feature.id} className="bg-gray-900 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Badge
                          variant="outline"
                          className={
                            feature.status === "planned"
                              ? "border-green-500 text-green-500"
                              : "border-blue-500 text-blue-500"
                          }
                        >
                          {feature.status === "planned" ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {feature.status.replace("-", " ")}
                        </Badge>
                        <Badge variant="outline" className="border-purple-500 text-purple-500">
                          {feature.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">
                        <Link href={`/feature-voting/${feature.id}`} className="hover:text-blue-400">
                          {feature.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Ends: {formatDate(feature.votingEnds)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{feature.comments}</span>
                        </div>
                      </div>
                      <Progress value={(feature.votes / 150) * 100} className="h-2 bg-gray-800" />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <ThumbsUp className="h-4 w-4 text-purple-500 mr-1" />
                          <span>{feature.votes} votes</span>
                        </div>
                        <div className="text-sm text-gray-400">{getDaysRemaining(feature.votingEnds)} days left</div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleVote(feature.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Voted
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              {sortedFeatures.filter((feature) => feature.hasVoted).length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">No votes yet</h3>
                  <p className="text-gray-400 mb-6">You haven't voted for any features yet.</p>
                  <Button asChild>
                    <Link href="/feature-voting">Browse Features</Link>
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {sortedFeatures.length === 0 && (
        <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg">
          <Lightbulb className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No features found</h3>
          <p className="text-gray-400 mb-6">No features match your current filters.</p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setCategoryFilter("all")
              setStatusFilter("all")
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      <div className="mt-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Have a feature idea?</h2>
            <p className="text-gray-300 max-w-md">
              We're always looking for ways to improve MIX & MINGLE. Share your ideas with us!
            </p>
          </div>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 rounded-full">
            <Link href="/feedback?type=feature">Suggest a Feature</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
