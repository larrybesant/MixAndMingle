"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/ui/loading-button"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FeedbackPage() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      // This would be a real API call in production
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success toast
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it soon.",
      })

      // Reset form
      setTitle("")
      setCategory("")
      setDescription("")

      // Redirect to thank you page
      router.push("/feedback/thank-you")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-cyan-500">
        Submit Feedback
      </h1>
      <p className="text-center text-muted-foreground mb-10">
        Help us improve by sharing your thoughts and suggestions
      </p>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Beta Feedback Form</CardTitle>
          <CardDescription>Your feedback helps us make MIX & MINGLE better for everyone</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Feedback Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide details about your feedback"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <LoadingButton type="submit" className="w-full sm:w-auto" isLoading={isLoading} loadingText="Submitting...">
              Submit Feedback
            </LoadingButton>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
