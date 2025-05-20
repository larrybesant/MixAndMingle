"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface BetaTester {
  id: string
  displayName: string
  email: string
  status: string
}

interface BetaEmailSenderProps {
  testers: BetaTester[]
}

export function BetaEmailSender({ testers }: BetaEmailSenderProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [selectedTesters, setSelectedTesters] = useState<string[]>([])
  const [filter, setFilter] = useState("all")
  const [sending, setSending] = useState(false)

  const filteredTesters = testers.filter((tester) => {
    if (filter === "all") return true
    return tester.status === filter
  })

  const toggleTesterSelection = (testerId: string) => {
    setSelectedTesters((prev) => (prev.includes(testerId) ? prev.filter((id) => id !== testerId) : [...prev, testerId]))
  }

  const selectAllTesters = () => {
    if (selectedTesters.length === filteredTesters.length) {
      setSelectedTesters([])
    } else {
      setSelectedTesters(filteredTesters.map((t) => t.id))
    }
  }

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject.",
        variant: "destructive",
      })
      return
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email message.",
        variant: "destructive",
      })
      return
    }

    if (selectedTesters.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one recipient.",
        variant: "destructive",
      })
      return
    }

    setSending(true)

    try {
      // In a real implementation, you would call an API endpoint to send emails
      // For this demo, we'll simulate a successful email send

      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Emails Sent",
        description: `Successfully sent emails to ${selectedTesters.length} beta testers.`,
      })

      setSubject("")
      setMessage("")
      setSelectedTesters([])
    } catch (error) {
      console.error("Error sending emails:", error)
      toast({
        title: "Error",
        description: "Failed to send emails. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Beta Testers</CardTitle>
          <CardDescription>Send announcements, updates, and information to your beta testers</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Email Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message to beta testers"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleSendEmail}
            disabled={sending || !subject || !message || selectedTesters.length === 0}
            className="w-full"
          >
            {sending ? "Sending..." : `Send Email to ${selectedTesters.length} Testers`}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Select Recipients</CardTitle>
          <CardDescription>Choose which beta testers should receive this email</CardDescription>

          <div className="mt-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Testers</SelectItem>
                <SelectItem value="active">Active Testers</SelectItem>
                <SelectItem value="inactive">Inactive Testers</SelectItem>
                <SelectItem value="pending">Pending Testers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedTesters.length === filteredTesters.length && filteredTesters.length > 0}
                      onCheckedChange={selectAllTesters}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredTesters.map((tester) => (
                  <TableRow key={tester.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTesters.includes(tester.id)}
                        onCheckedChange={() => toggleTesterSelection(tester.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tester.displayName}</TableCell>
                    <TableCell>{tester.email}</TableCell>
                    <TableCell className="capitalize">{tester.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredTesters.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No beta testers match the selected filter</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
