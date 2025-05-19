"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type EmailLog = {
  id: string
  recipient_email: string
  subject: string
  template: string
  status: "pending" | "sent" | "failed"
  created_at: string
}

export function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from("email_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)

        if (error) {
          console.error("Error fetching email logs:", error)
          return
        }

        setLogs(data || [])
      } catch (error) {
        console.error("Error in fetchLogs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()

    // Set up real-time subscription
    const channel = supabase
      .channel("email_logs_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "email_logs",
        },
        (payload) => {
          setLogs((current) => [payload.new as EmailLog, ...current])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (logs.length === 0) {
    return <div className="text-center py-8">No email logs found</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Template</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
              <TableCell>{log.recipient_email}</TableCell>
              <TableCell>{log.subject}</TableCell>
              <TableCell>{log.template}</TableCell>
              <TableCell>
                <Badge
                  variant={log.status === "sent" ? "default" : log.status === "pending" ? "outline" : "destructive"}
                >
                  {log.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
