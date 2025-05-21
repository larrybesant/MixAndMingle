"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { captureError } from "@/lib/sentry"
import { useAuth } from "@/hooks/use-auth"
import { useFirebase } from "@/hooks/use-firebase"
import { MessageSquareIcon, ImageIcon, XIcon } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Define form schema with Zod
const feedbackSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Please provide detailed feedback" }),
  category: z.enum(["general", "ui", "performance", "feature", "bug", "other"]),
  satisfaction: z.enum(["very-satisfied", "satisfied", "neutral", "dissatisfied", "very-dissatisfied"]),
  featureRequest: z.boolean().default(false),
  screenshot: z.any().optional(),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

export function FeedbackForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { addDocument, updateDocument, uploadFile } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  // Initialize form
  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "general",
      satisfaction: "neutral",
      featureRequest: false,
      screenshot: undefined,
    },
  })

  // Handle screenshot change
  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      form.setValue("screenshot", file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setScreenshotPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove screenshot
  const removeScreenshot = () => {
    form.setValue("screenshot", undefined)
    setScreenshotPreview(null)
  }

  // Submit form
  const onSubmit = async (data: FeedbackFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit feedback",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload screenshot if exists
      let screenshotUrl = ""
      if (data.screenshot && data.screenshot instanceof File) {
        const fileName = `feedback/${user.uid}/${Date.now()}-${data.screenshot.name}`
        screenshotUrl = await uploadFile(fileName, data.screenshot)
      }

      // Create feedback document
      const feedback = {
        title: data.title,
        description: data.description,
        category: data.category,
        satisfaction: data.satisfaction,
        featureRequest: data.featureRequest,
        screenshot: screenshotUrl,
        status: "new",
        votes: 0,
        createdAt: new Date(),
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
      }

      const feedbackRef = await addDocument("feedback", feedback)

      // Update user's feedback count
      await updateDocument("betaUsers", user.uid, {
        feedbackCount: (user.feedbackCount || 0) + 1,
        points: (user.points || 0) + 10, // Award points for feedback
      })

      // Show success message
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      })

      // Reset form
      form.reset()
      setScreenshotPreview(null)
    } catch (error) {
      console.error("Error submitting feedback:", error)
      captureError(error instanceof Error ? error : new Error("Failed to submit feedback"), {
        user: user?.uid,
        formData: { ...data, screenshot: data.screenshot ? "File attached" : "No file" },
      })

      toast({
        title: "Error submitting feedback",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get satisfaction label
  const getSatisfactionLabel = (value: string) => {
    switch (value) {
      case "very-satisfied":
        return "Very Satisfied"
      case "satisfied":
        return "Satisfied"
      case "neutral":
        return "Neutral"
      case "dissatisfied":
        return "Dissatisfied"
      case "very-dissatisfied":
        return "Very Dissatisfied"
      default:
        return value
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <MessageSquareIcon className="mr-2 h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Share Your Feedback</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Feedback Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief summary of your feedback" {...field} />
                </FormControl>
                <FormDescription>Summarize your feedback in a few words</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detailed Feedback</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your thoughts, ideas, or experiences..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Please be as specific as possible</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General Feedback</SelectItem>
                      <SelectItem value="ui">User Interface</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="feature">Feature Feedback</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="satisfaction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Satisfaction</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex justify-between"
                    >
                      <FormItem className="flex flex-col items-center space-y-1">
                        <FormControl>
                          <RadioGroupItem value="very-dissatisfied" className="sr-only" />
                        </FormControl>
                        <span
                          className={`cursor-pointer p-1 rounded-full ${field.value === "very-dissatisfied" ? "bg-red-100 text-red-500" : "text-gray-400"}`}
                          onClick={() => form.setValue("satisfaction", "very-dissatisfied")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 9.05v-.1" />
                            <path d="M16 9.05v-.1" />
                            <path d="M16 16c-.5-1.5-2-2.5-4-2.5s-3.5 1-4 2.5" />
                          </svg>
                        </span>
                        <FormLabel className="text-xs font-normal">Very Dissatisfied</FormLabel>
                      </FormItem>

                      <FormItem className="flex flex-col items-center space-y-1">
                        <FormControl>
                          <RadioGroupItem value="dissatisfied" className="sr-only" />
                        </FormControl>
                        <span
                          className={`cursor-pointer p-1 rounded-full ${field.value === "dissatisfied" ? "bg-orange-100 text-orange-500" : "text-gray-400"}`}
                          onClick={() => form.setValue("satisfaction", "dissatisfied")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 9.05v-.1" />
                            <path d="M16 9.05v-.1" />
                            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                          </svg>
                        </span>
                        <FormLabel className="text-xs font-normal">Dissatisfied</FormLabel>
                      </FormItem>

                      <FormItem className="flex flex-col items-center space-y-1">
                        <FormControl>
                          <RadioGroupItem value="neutral" className="sr-only" />
                        </FormControl>
                        <span
                          className={`cursor-pointer p-1 rounded-full ${field.value === "neutral" ? "bg-yellow-100 text-yellow-500" : "text-gray-400"}`}
                          onClick={() => form.setValue("satisfaction", "neutral")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 9.05v-.1" />
                            <path d="M16 9.05v-.1" />
                            <path d="M8 15h8" />
                          </svg>
                        </span>
                        <FormLabel className="text-xs font-normal">Neutral</FormLabel>
                      </FormItem>

                      <FormItem className="flex flex-col items-center space-y-1">
                        <FormControl>
                          <RadioGroupItem value="satisfied" className="sr-only" />
                        </FormControl>
                        <span
                          className={`cursor-pointer p-1 rounded-full ${field.value === "satisfied" ? "bg-green-100 text-green-500" : "text-gray-400"}`}
                          onClick={() => form.setValue("satisfaction", "satisfied")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 9.05v-.1" />
                            <path d="M16 9.05v-.1" />
                            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                          </svg>
                        </span>
                        <FormLabel className="text-xs font-normal">Satisfied</FormLabel>
                      </FormItem>

                      <FormItem className="flex flex-col items-center space-y-1">
                        <FormControl>
                          <RadioGroupItem value="very-satisfied" className="sr-only" />
                        </FormControl>
                        <span
                          className={`cursor-pointer p-1 rounded-full ${field.value === "very-satisfied" ? "bg-green-100 text-green-500" : "text-gray-400"}`}
                          onClick={() => form.setValue("satisfaction", "very-satisfied")}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 9.05v-.1" />
                            <path d="M16 9.05v-.1" />
                            <path d="M8 13a4 4 0 0 0 8 0" />
                          </svg>
                        </span>
                        <FormLabel className="text-xs font-normal">Very Satisfied</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="featureRequest"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 mt-1" />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Feature Request</FormLabel>
                  <FormDescription>Check this if you're suggesting a new feature</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Screenshot (Optional)</FormLabel>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("screenshot-upload")?.click()}
                className="flex items-center"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {screenshotPreview ? "Change Screenshot" : "Add Screenshot"}
              </Button>

              <Input
                id="screenshot-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleScreenshotChange}
              />

              {screenshotPreview && (
                <Button type="button" variant="outline" size="sm" onClick={removeScreenshot} className="text-red-500">
                  <XIcon className="h-4 w-4" />
                </Button>
              )}
            </div>

            {screenshotPreview && (
              <div className="mt-2 relative">
                <img
                  src={screenshotPreview || "/placeholder.svg"}
                  alt="Screenshot preview"
                  className="max-h-[200px] rounded-md border border-gray-200 dark:border-gray-700"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
