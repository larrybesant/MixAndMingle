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
import { BugIcon, ImageIcon, XIcon } from "lucide-react"

// Define form schema with Zod
const bugReportSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(10, { message: "Please provide a detailed description" }),
  steps: z.string().min(10, { message: "Please provide steps to reproduce" }),
  expected: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  device: z.string().optional(),
  browser: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  screenshot: z.any().optional(),
})

type BugReportFormValues = z.infer<typeof bugReportSchema>

export function BugReportForm() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { addDocument, uploadFile } = useFirebase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)

  // Initialize form
  const form = useForm<BugReportFormValues>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      title: "",
      description: "",
      steps: "",
      expected: "",
      severity: "medium",
      device: typeof navigator !== "undefined" ? navigator.userAgent : "",
      browser: typeof navigator !== "undefined" ? getBrowserInfo() : "",
      url: typeof window !== "undefined" ? window.location.href : "",
      screenshot: undefined,
    },
  })

  // Get browser info
  function getBrowserInfo() {
    const userAgent = navigator.userAgent
    let browserName

    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "Chrome"
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "Firefox"
    } else if (userAgent.match(/safari/i)) {
      browserName = "Safari"
    } else if (userAgent.match(/opr\//i)) {
      browserName = "Opera"
    } else if (userAgent.match(/edg/i)) {
      browserName = "Edge"
    } else {
      browserName = "Unknown"
    }

    return browserName
  }

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
  const onSubmit = async (data: BugReportFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a bug report",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload screenshot if exists
      let screenshotUrl = ""
      if (data.screenshot && data.screenshot instanceof File) {
        const fileName = `bug-reports/${user.uid}/${Date.now()}-${data.screenshot.name}`
        screenshotUrl = await uploadFile(fileName, data.screenshot)
      }

      // Create bug report document
      const bugReport = {
        title: data.title,
        description: data.description,
        steps: data.steps,
        expected: data.expected || "",
        severity: data.severity,
        device: data.device || "",
        browser: data.browser || "",
        url: data.url || "",
        screenshot: screenshotUrl,
        status: "new",
        createdAt: new Date(),
        userId: user.uid,
        userEmail: user.email || "",
        userName: user.displayName || "",
      }

      await addDocument("bugReports", bugReport)

      // Show success message
      toast({
        title: "Bug report submitted",
        description: "Thank you for helping improve Mix & Mingle!",
      })

      // Reset form
      form.reset()
      setScreenshotPreview(null)
    } catch (error) {
      console.error("Error submitting bug report:", error)
      captureError(error instanceof Error ? error : new Error("Failed to submit bug report"), {
        user: user?.uid,
        formData: { ...data, screenshot: data.screenshot ? "File attached" : "No file" },
      })

      toast({
        title: "Error submitting report",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <BugIcon className="mr-2 h-6 w-6 text-red-500" />
        <h2 className="text-2xl font-bold">Report a Bug</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bug Title</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description of the issue" {...field} />
                </FormControl>
                <FormDescription>Summarize the bug in a few words</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detailed description of what happened" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormDescription>Describe the bug in detail</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="steps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steps to Reproduce</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="1. Click on...\n2. Enter text...\n3. ..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>List the steps to reproduce this bug</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expected"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Behavior</FormLabel>
                <FormControl>
                  <Textarea placeholder="What should have happened instead?" className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor issue, doesn't affect usage</SelectItem>
                    <SelectItem value="medium">Medium - Affects usage but has workaround</SelectItem>
                    <SelectItem value="high">High - Significantly affects usage</SelectItem>
                    <SelectItem value="critical">Critical - Completely blocks usage</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
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
            {isSubmitting ? "Submitting..." : "Submit Bug Report"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
