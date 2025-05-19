"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MapPinIcon, Clock, Music } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface EventsListProps {
  events: any[]
}

export function EventsList({ events }: EventsListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No events found</h3>
        <p className="text-muted-foreground mt-1">Create your first event to get started</p>
        <Button className="mt-4" asChild>
          <Link href="/events/new">Create Event</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <Badge variant={getEventStatusBadge(new Date(event.start_time))}>
                {getEventStatus(new Date(event.start_time))}
              </Badge>
            </div>
            <CardDescription className="flex items-center mt-2">
              <CalendarIcon className="h-4 w-4 mr-1" />
              {format(new Date(event.start_time), "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {format(new Date(event.start_time), "h:mm a")} - {format(new Date(event.end_time), "h:mm a")}
              </span>
            </div>
            {event.dj && (
              <div className="flex items-center text-sm">
                <Music className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>DJ: {event.dj.artist_name}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/events/${event.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function getEventStatus(date: Date): string {
  const now = new Date()
  if (date < now) return "Past"
  if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return "Today"
  if (date.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) return "This Week"
  return "Upcoming"
}

function getEventStatusBadge(date: Date): "default" | "secondary" | "outline" {
  const now = new Date()
  if (date < now) return "outline"
  if (date.getTime() - now.getTime() < 24 * 60 * 60 * 1000) return "default"
  return "secondary"
}
