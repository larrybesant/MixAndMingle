"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { createLiveStream } from "@/app/actions/live-streams"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CreateStreamFormProps {
  events: Array<{
    id: string
    title: string
  }>
}

export default function CreateStreamForm({ events }: CreateStreamFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<string>("")
  const [isPublic, setIsPublic] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    // Add the selected event and public status to the form data
    formData.set("eventId", selectedEvent)
    formData.set("isPublic", isPublic.toString())

    try {
      const result = await createLiveStream(formData)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: "Stream created successfully!",
        })
        router.push(`/dj/streams/${result.streamId}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-cyan-500 text-white">
        <CardTitle className="text-2xl">Create Live Stream</CardTitle>
        <CardDescription className="text-white/80">Set up your live DJ set</CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input id="title" name="title" required placeholder="Friday Night House Mix" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Tell viewers what to expect from your stream"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event">Associated Event (Optional)</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Select an event (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledStart">Scheduled Start Time</Label>
            <Input id="scheduledStart" name="scheduledStart" type="datetime-local" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL (Optional)</Label>
            <Input id="thumbnailUrl" name="thumbnailUrl" placeholder="https://example.com/your-thumbnail.jpg" />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="isPublic">Make stream public (visible to everyone)</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-orange-500 to-cyan-500 hover:from-orange-600 hover:to-cyan-600"
          >
            {isSubmitting ? "Creating..." : "Create Stream"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
