"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createEvent, createDjProfile, createLiveStream } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { EventsList } from "../events/events-list"
import { DjProfilesList } from "../dj-profiles/dj-profiles-list"
import { LiveStreamsList } from "../live-streams/live-streams-list"
import { djProfiles } from "../data/djProfiles" // Updated import path

interface DashboardTabsProps {
  profile: any
  events: any[]
  djProfile: any
  streams: any[]
}

// Default export
export default function DashboardTabs({ profile, events, djProfile, streams }: DashboardTabsProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("events")
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isCreatingDjProfile, setIsCreatingDjProfile] = useState(false)
  const [isCreatingStream, setIsCreatingStream] = useState(false)

  const handleCreateEvent = async (formData: any) => {
    try {
      const result = await createEvent(formData)
      if (result.success) {
        toast({
          title: "Event Created",
          description: "Your event has been created successfully.",
        })
        setIsCreatingEvent(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleCreateDjProfile = async (formData: any) => {
    try {
      const result = await createDjProfile(formData)
      if (result.success) {
        toast({
          title: "DJ Profile Created",
          description: "Your DJ profile has been created successfully.",
        })
        setIsCreatingDjProfile(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  const handleCreateLiveStream = async (formData: any) => {
    try {
      const result = await createLiveStream(formData)
      if (result.success) {
        toast({
          title: "Live Stream Created",
          description: "Your live stream has been scheduled successfully.",
        })
        setIsCreatingStream(false)
      } else {
        toast({
          title: "Error",
          description: result.message || "An error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  return (
    <Tabs defaultValue="events" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-3 md:w-[400px]">
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="djs">DJ Profiles</TabsTrigger>
        <TabsTrigger value="streams">Live Streams</TabsTrigger>
      </TabsList>
      <TabsContent value="events" className="space-y-4">
        <EventsList events={events} />
      </TabsContent>
      <TabsContent value="djs" className="space-y-4">
        <DjProfilesList djProfiles={djProfiles} />
      </TabsContent>
      <TabsContent value="streams" className="space-y-4">
        <LiveStreamsList liveStreams={streams} />
      </TabsContent>
    </Tabs>
  )
}

// Named export
export { DashboardTabs }
