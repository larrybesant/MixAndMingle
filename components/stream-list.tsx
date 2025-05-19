"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Music, PlusCircle } from "lucide-react"

interface StreamListProps {
  liveStreams: any[]
  upcomingStreams: any[]
  pastStreams: any[]
  loading: boolean
  isDj: boolean
}

export function StreamList({ liveStreams, upcomingStreams, pastStreams, loading, isDj }: StreamListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")

  // Filter streams based on search query and genre
  const filterStreams = (streams: any[]) => {
    return streams.filter((stream) => {
      const matchesSearch =
        stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stream.dj_profiles?.artist_name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesGenre = genreFilter === "all" || stream.genres?.some((g: any) => g.id === genreFilter)

      return matchesSearch && matchesGenre
    })
  }

  const filteredLiveStreams = filterStreams(liveStreams)
  const filteredUpcomingStreams = filterStreams(upcomingStreams)
  const filteredPastStreams = filterStreams(pastStreams)

  const renderStreamCard = (stream: any) => {
    const djProfile = stream.dj_profiles
    const djUser = djProfile?.profiles

    return (
      <Card key={stream.id} className="overflow-hidden">
        <div className="aspect-video bg-gray-200 relative">
          <img
            src={stream.thumbnail_url || "/placeholder.svg?height=200&width=400&query=music+dj+stream"}
            alt={stream.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant={
                stream.status === "live" ? "destructive" : stream.status === "scheduled" ? "default" : "secondary"
              }
            >
              {stream.status === "live" ? "LIVE" : stream.status === "scheduled" ? "UPCOMING" : "ENDED"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold truncate">{stream.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={djUser?.avatar_url || "/placeholder.svg"} alt={djProfile?.artist_name} />
              <AvatarFallback>{djProfile?.artist_name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{djProfile?.artist_name}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stream.status === "live"
              ? `Started ${new Date(stream.actual_start).toLocaleString()}`
              : stream.status === "scheduled"
                ? `Scheduled for ${new Date(stream.scheduled_start).toLocaleString()}`
                : `Ended ${new Date(stream.ended_at).toLocaleString()}`}
          </p>
          {stream.status === "live" && (
            <p className="text-xs font-medium mt-1">
              {stream.viewer_count} {stream.viewer_count === 1 ? "viewer" : "viewers"}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full">
            <Link href={`/streams/${stream.id}`}>
              {stream.status === "live"
                ? "Watch Now"
                : stream.status === "scheduled"
                  ? "View Details"
                  : "Watch Recording"}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Music className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No streams found</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search streams..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="techno">Techno</SelectItem>
              <SelectItem value="hiphop">Hip Hop</SelectItem>
              <SelectItem value="rnb">R&B</SelectItem>
              <SelectItem value="edm">EDM</SelectItem>
            </SelectContent>
          </Select>

          {isDj && (
            <Button asChild>
              <Link href="/dashboard/streams/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create
              </Link>
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="live">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live" className="relative">
              Live
              {filteredLiveStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredLiveStreams.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="relative">
              Upcoming
              {filteredUpcomingStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredUpcomingStreams.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="relative">
              Past
              {filteredPastStreams.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {filteredPastStreams.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="pt-6">
            {filteredLiveStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLiveStreams.map(renderStreamCard)}
              </div>
            ) : (
              renderEmptyState("No live streams available right now. Check back later or start your own stream!")
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="pt-6">
            {filteredUpcomingStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUpcomingStreams.map(renderStreamCard)}
              </div>
            ) : (
              renderEmptyState("No upcoming streams scheduled. Follow your favorite DJs to get notified!")
            )}
          </TabsContent>

          <TabsContent value="past" className="pt-6">
            {filteredPastStreams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPastStreams.map(renderStreamCard)}
              </div>
            ) : (
              renderEmptyState("No past streams available. Check back after some live streams have ended!")
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
