"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, UserIcon, RadioIcon } from "lucide-react"

interface LiveStream {
  id: string
  title: string
  description: string
  scheduledFor: string
  djName: string
  status?: "scheduled" | "live" | "ended"
}

interface LiveStreamsListProps {
  liveStreams: LiveStream[]
}

export function LiveStreamsList({ liveStreams }: LiveStreamsListProps) {
  if (!liveStreams || liveStreams.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium">No live streams found</h3>
        <p className="text-muted-foreground mt-1">Schedule a live stream to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {liveStreams.map((stream) => (
        <Card key={stream.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{stream.title}</CardTitle>
                <CardDescription>{stream.description}</CardDescription>
              </div>
              {stream.status && (
                <div
                  className={`px-2 py-1 text-xs rounded-full ${
                    stream.status === "live"
                      ? "bg-red-100 text-red-800"
                      : stream.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{new Date(stream.scheduledFor).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <UserIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{stream.djName}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant={stream.status === "live" ? "default" : "outline"}
              className="w-full"
              disabled={stream.status === "ended"}
            >
              {stream.status === "live" ? (
                <>
                  <RadioIcon className="mr-2 h-4 w-4 animate-pulse" />
                  Join Stream
                </>
              ) : stream.status === "scheduled" ? (
                "Set Reminder"
              ) : (
                "View Recording"
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
