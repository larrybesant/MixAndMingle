"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { redirect } from "next/navigation"
import Link from "next/link"
import { GenerateReportButton } from "@/components/admin/generate-report-button"
import { useToast } from "@/hooks/use-toast"

interface BetaReport {
  id: string
  period: {
    start: { toDate: () => Date }
    end: { toDate: () => Date }
  }
  createdAt: { toDate: () => Date }
  metrics: {
    totalTesters: number
    activeTesters: number
    newTesters: number
    totalFeedback: number
  }
}

export default function BetaReportsPage() {
  const [reports, setReports] = useState<BetaReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) return

      try {
        const userDoc = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)))

        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data()
          if (userData.role !== "admin") {
            redirect("/dashboard")
          }
        } else {
          redirect("/dashboard")
        }
      } catch (error) {
        console.error("Error checking admin access:", error)
        redirect("/dashboard")
      }
    }

    checkAdminAccess()
  }, [user])

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const reportsQuery = query(collection(db, "betaReports"), orderBy("createdAt", "desc"))
        const reportsSnapshot = await getDocs(reportsQuery)

        const reportsList: BetaReport[] = []
        reportsSnapshot.forEach((doc) => {
          reportsList.push({ id: doc.id, ...doc.data() } as BetaReport)
        })

        setReports(reportsList)
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchReports()
    }
  }, [user])

  const handleGenerateReport = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch("/api/admin/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate report")
      }

      toast({
        title: "Report Generated",
        description: "The report has been generated successfully.",
      })

      // Refresh the reports list
      const reportsQuery = query(collection(db, "betaReports"), orderBy("createdAt", "desc"))
      const reportsSnapshot = await getDocs(reportsQuery)

      const reportsList: BetaReport[] = []
      reportsSnapshot.forEach((doc) => {
        reportsList.push({ id: doc.id, ...doc.data() } as BetaReport)
      })

      setReports(reportsList)
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Beta Reports</h1>
          <p className="text-muted-foreground">View weekly beta testing reports</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild className="mb-4 w-full md:w-auto md:mr-4">
            <Link href="/admin/analytics">View Live Analytics</Link>
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Create a report for a specific date range</CardDescription>
        </CardHeader>
        <CardContent>
          <GenerateReportButton onGenerate={handleGenerateReport} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report History</CardTitle>
          <CardDescription>Weekly summaries of beta testing metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Period</TableHead>
                  <TableHead>Generated On</TableHead>
                  <TableHead>Active Testers</TableHead>
                  <TableHead>New Testers</TableHead>
                  <TableHead>Feedback Items</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {report.period.start.toDate().toLocaleDateString()} -{" "}
                      {report.period.end.toDate().toLocaleDateString()}
                    </TableCell>
                    <TableCell>{report.createdAt.toDate().toLocaleDateString()}</TableCell>
                    <TableCell>{report.metrics.activeTesters}</TableCell>
                    <TableCell>{report.metrics.newTesters}</TableCell>
                    <TableCell>{report.metrics.totalFeedback}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/reports/${report.id}`}>View Report</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reports available yet. Reports are generated weekly.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
