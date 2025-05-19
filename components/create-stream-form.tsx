"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createStream } from "@/services/stream-service"
import { getDjProfileByUserId } from "@/services/dj-service"

export function CreateStreamForm() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledStart, setScheduledStart] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a stream",
        variant: "destructive",
      })
      return
    }

    if (!title || !scheduledStart) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Get DJ profile
      const djProfile = await getDjProfileByUserId(user.uid)

      if (!djProfile) {
        toast({
          title: "Error",
          description: "You need to create a DJ profile first",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Create stream
      const stream = await createStream(djProfile.id, {
        title,
        description,
        scheduled_start: scheduledStart,
        thumbnail_url: thumbnailUrl,
        is_public: isPublic,
      })

      if (stream) {
        toast({
          title: "Success",
          description: "Stream created successfully",
        })
        router.push("/dashboard/streams")
      } else {
        throw new Error("Failed to create stream")
      }
    } catch (error) {
      console.error("Error creating stream:", error)
      toast({
        title: "Error",
        description: "Failed to create stream",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Stream</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Awesome DJ Set"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers what to expect in your stream..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledStart">Scheduled Start Time *</Label>
            <Input
              id="scheduledStart"
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="isPublic">Public Stream</Label>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Stream"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
