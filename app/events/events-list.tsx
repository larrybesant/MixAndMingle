"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  attendees?: number
}

interface EventsListProps {
  events: Event[]
}

export function EventsList({ events }: EventsListProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center p-12 border border-dashed rounded-lg">
        <h3 className="text-lg font-medium">No events found</h3>
        <p className="text-muted-foreground mt-1">Create your first event to get started.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4 opacity-70" />
                <span>{event.location}</span>
              </div>
              {event.attendees !== undefined && (
                <div className="flex items-center">
                  <UsersIcon className="mr-2 h-4 w-4 opacity-70" />
                  <span>{event.attendees} attendees</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
