"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendTestEmail } from "./actions"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function EmailTestForm() {
  const [email, setEmail] = useState("")
  const [template, setTemplate] = useState("event-invitation")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await sendTestEmail(email, template)

      if (result.success) {
        toast({
          title: "Email sent successfully",
          description: `Test email sent to ${email}`,
        })
      } else {
        toast({
          title: "Failed to send email",
          description: result.error || "An unknown error occurred",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email. Check server logs for details.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Recipient Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">Email Template</Label>
        <Select value={template} onValueChange={setTemplate} required>
          <SelectTrigger id="template">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="event-invitation">Event Invitation</SelectItem>
            <SelectItem value="stream-notification">Stream Notification</SelectItem>
            <SelectItem value="event-reminder">Event Reminder</SelectItem>
            <SelectItem value="welcome">Welcome Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Test Email"
        )}
      </Button>
    </form>
  )
}
