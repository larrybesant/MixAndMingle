"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getDjProfileByUserId } from "@/services/dj-service"
import { createStream } from "@/services/stream-service"

export default function CreateStreamPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [djProfile, setDjProfile] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledStart, setScheduledStart] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Fetch DJ profile
        const profile = await getDjProfileByUserId(user.uid)

        if (!profile) {
          toast({
            title: "DJ Profile Required",
            description: "You need to create a DJ profile before creating a stream",
            variant: "destructive",
          })
          router.push("/dashboard/dj-profile")
          return
        }

        setDjProfile(profile)
      } catch (error) {
        console.error("Error fetching DJ profile:", error)
        toast({
          title: "Error",
          description: "Failed to load DJ profile data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, toast, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !djProfile) return

    try {
      setSubmitting(true)

      // Create stream
      const stream = await createStream(djProfile.id, {
        title,
        description,
        scheduled_start: new Date(scheduledStart).toISOString(),
        thumbnail_url: thumbnailUrl,
        is_public: isPublic,
      })

      if (stream) {
        toast({
          title: "Stream Created",
          description: "Your stream has been created successfully",
        })

        router.push("/dashboard/streams")
      }
    } catch (error) {
      console.error("Error creating stream:", error)
      toast({
        title: "Error",
        description: "Failed to create stream",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Create Stream</h2>
        <p className="text-gray-400">Schedule a new live stream session</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Stream Details</CardTitle>
            <CardDescription className="text-gray-400">Provide information about your upcoming stream</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Stream Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your stream a catchy title"
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what to expect from your stream"
                rows={4}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledStart" className="text-white">
                Scheduled Start Time
              </Label>
              <Input
                id="scheduledStart"
                type="datetime-local"
                value={scheduledStart}
                onChange={(e) => setScheduledStart(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnailUrl" className="text-white">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="URL to an image for your stream thumbnail"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="isPublic" checked={isPublic} onCheckedChange={setIsPublic} />
              <Label htmlFor="isPublic" className="text-white">
                Public Stream
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={submitting || !title || !scheduledStart}
            >
              {submitting ? "Creating..." : "Create Stream"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
