import { CalendarDays, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data for recent events
const recentEvents = [
  {
    id: "1",
    title: "Summer Networking Mixer",
    location: "Central Park, NY",
    date: "2023-06-15T18:00:00Z",
    attendees: 42,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Tech Startup Meetup",
    location: "Innovation Hub, SF",
    date: "2023-06-12T17:30:00Z",
    attendees: 78,
    status: "upcoming",
  },
  {
    id: "3",
    title: "Creative Arts Workshop",
    location: "Gallery Space, LA",
    date: "2023-06-10T14:00:00Z",
    attendees: 25,
    status: "upcoming",
  },
  {
    id: "4",
    title: "Fitness & Wellness Gathering",
    location: "Riverside Park, Chicago",
    date: "2023-06-08T09:00:00Z",
    attendees: 35,
    status: "cancelled",
  },
]

export default function AdminRecentEvents() {
  return (
    <div className="space-y-4">
      {recentEvents.map((event) => (
        <div key={event.id} className="border rounded-md p-3">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-sm">{event.title}</h3>
            <Badge
              variant={event.status === "upcoming" ? "default" : event.status === "ongoing" ? "outline" : "secondary"}
            >
              {event.status}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 mr-1" />
              {new Date(event.date).toLocaleDateString()} at{" "}
              {new Date(event.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              {event.location}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 mr-1" />
              {event.attendees} attendees
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
