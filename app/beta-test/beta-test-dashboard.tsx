"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createEvent, createDjProfile, createLiveStream } from "./actions"
import { Calendar, Music, Video, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function BetaTestDashboard({
  user,
  profile,
  events,
  djProfiles,
  liveStreams,
}: {
  user: any
  profile: any
  events: any[]
  djProfiles: any[]
  liveStreams: any[]
}) {
  const [activeTab, setActiveTab] = useState("events")
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isCreatingDjProfile, setIsCreatingDjProfile] = useState(false)
  const [isCreatingLiveStream, setIsCreatingLiveStream] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const hasDjProfile = djProfiles.some((profile) => profile.id === user.id)

  const handleCreateEvent = async (formData: FormData) => {
    setIsCreatingEvent(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const result = await createEvent(formData)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setSuccessMessage("Event created successfully!")
        // Reset form
        const form = document.getElementById("create-event-form") as HTMLFormElement
        if (form) form.reset()
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create event")
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const handleCreateDjProfile = async (formData: FormData) => {
    setIsCreatingDjProfile(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const result = await createDjProfile(formData)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setSuccessMessage("DJ profile created successfully!")
        // Reset form
        const form = document.getElementById("create-dj-profile-form") as HTMLFormElement
        if (form) form.reset()
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create DJ profile")
    } finally {
      setIsCreatingDjProfile(false)
    }
  }

  const handleCreateLiveStream = async (formData: FormData) => {
    setIsCreatingLiveStream(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const result = await createLiveStream(formData)
      if (result.error) {
        setErrorMessage(result.error)
      } else {
        setSuccessMessage("Live stream created successfully!")
        // Reset form
        const form = document.getElementById("create-live-stream-form") as HTMLFormElement
        if (form) form.reset()
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create live stream")
    } finally {
      setIsCreatingLiveStream(false)
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="dj-profiles" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            DJ Profiles
          </TabsTrigger>
          <TabsTrigger value="live-streams" className="flex items-center gap-2" disabled={!hasDjProfile}>
            <Video className="h-4 w-4" />
            Live Streams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Event</CardTitle>
              <CardDescription>Create a new event for beta testing</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="create-event-form" action={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" placeholder="Enter event title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" placeholder="Enter event location" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter event description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" name="startDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" type="time" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" name="endDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" type="time" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" name="capacity" type="number" min="1" placeholder="Enter capacity" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input id="imageUrl" name="imageUrl" placeholder="Enter image URL" />
                  </div>
                </div>
                <input type="hidden" name="organizerId" value={user.id} />
                <Button type="submit" className="w-full" disabled={isCreatingEvent}>
                  {isCreatingEvent ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events ({events.length})</CardTitle>
              <CardDescription>All events in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>{event.location}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(event.start_date).toLocaleDateString()} at {event.start_time}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No events found. Create your first event above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dj-profiles" className="space-y-6">
          {!hasDjProfile && (
            <Card>
              <CardHeader>
                <CardTitle>Create DJ Profile</CardTitle>
                <CardDescription>Create your DJ profile for beta testing</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="create-dj-profile-form" action={handleCreateDjProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="artistName">Artist Name</Label>
                    <Input id="artistName" name="artistName" placeholder="Enter your artist name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" placeholder="Tell us about yourself as a DJ" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="genres">Genres</Label>
                      <Input id="genres" name="genres" placeholder="House, Techno, etc. (comma separated)" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Years of Experience</Label>
                      <Input
                        id="experienceYears"
                        name="experienceYears"
                        type="number"
                        min="0"
                        placeholder="Years of experience"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      name="hourlyRate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Your hourly rate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioLinks">Portfolio Links</Label>
                    <Textarea
                      id="portfolioLinks"
                      name="portfolioLinks"
                      placeholder="Enter links to your music, one per line"
                      rows={3}
                    />
                  </div>
                  <input type="hidden" name="userId" value={user.id} />
                  <Button type="submit" className="w-full" disabled={isCreatingDjProfile}>
                    {isCreatingDjProfile ? "Creating..." : "Create DJ Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>DJ Profiles ({djProfiles.length})</CardTitle>
              <CardDescription>All DJ profiles in the system</CardDescription>
            </CardHeader>
            <CardContent>
              {djProfiles.length > 0 ? (
                <div className="space-y-4">
                  {djProfiles.map((dj) => (
                    <Card key={dj.id}>
                      <CardHeader>
                        <CardTitle>{dj.artist_name}</CardTitle>
                        <CardDescription>
                          {dj.profiles?.first_name} {dj.profiles?.last_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{dj.bio}</p>
                        {dj.genre && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {dj.genre.map((genre: string, index: number) => (
                              <span
                                key={index}
                                className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dj-profiles/${dj.id}`}>View Profile</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No DJ profiles found. Create your DJ profile above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live-streams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Live Stream</CardTitle>
              <CardDescription>Schedule a new live stream for beta testing</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="create-live-stream-form" action={handleCreateLiveStream} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Stream Title</Label>
                  <Input id="title" name="title" placeholder="Enter stream title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Enter stream description" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledStart">Scheduled Start</Label>
                  <Input id="scheduledStart" name="scheduledStart" type="datetime-local" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                  <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="Enter thumbnail URL" />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    value="true"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isPublic">Public Stream</Label>
                </div>
                <input type="hidden" name="djId" value={user.id} />
                <Button type="submit" className="w-full" disabled={isCreatingLiveStream}>
                  {isCreatingLiveStream ? "Creating..." : "Create Live Stream"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Streams ({liveStreams.length})</CardTitle>
              <CardDescription>All scheduled and live streams</CardDescription>
            </CardHeader>
            <CardContent>
              {liveStreams.length > 0 ? (
                <div className="space-y-4">
                  {liveStreams.map((stream) => (
                    <Card key={stream.id}>
                      <CardHeader className={stream.status === "live" ? "bg-red-50" : ""}>
                        <div className="flex justify-between">
                          <CardTitle>{stream.title}</CardTitle>
                          {stream.status === "live" && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">LIVE</span>
                          )}
                        </div>
                        <CardDescription>DJ: {stream.dj?.artist_name}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{stream.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {stream.scheduled_start
                              ? new Date(stream.scheduled_start).toLocaleString()
                              : "Not scheduled"}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/streams/${stream.id}`}>
                            {stream.status === "live" ? "Watch Stream" : "View Details"}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No live streams found. Create your first stream above.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
