"use client"

import { useState, useEffect } from "react"
import { collection, query, orderBy, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { BetaInvitationEmail } from "@/components/beta-email-template"

interface BetaApplication {
  id: string
  name: string
  email: string
  age: string
  musicInterest: string
  experience: string
  device: string
  motivation: string
  availability: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

interface BetaFeedback {
  id: string
  userId: string
  userName: string
  userEmail: string
  type: "bug" | "suggestion" | "general"
  content: string
  status: "pending" | "in-progress" | "completed" | "rejected"
  createdAt: any
}

export default function BetaAdminPage() {
  const [applications, setApplications] = useState<BetaApplication[]>([])
  const [feedback, setFeedback] = useState<BetaFeedback[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [emailTemplate, setEmailTemplate] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load applications
        const applicationsQuery = query(collection(db, "betaApplications"), orderBy("submittedAt", "desc"))
        const applicationsSnapshot = await getDocs(applicationsQuery)
        const applicationsData: BetaApplication[] = []

        applicationsSnapshot.forEach((doc) => {
          applicationsData.push({
            id: doc.id,
            ...doc.data(),
          } as BetaApplication)
        })

        setApplications(applicationsData)

        // Load feedback
        const feedbackQuery = query(collection(db, "betaFeedback"), orderBy("createdAt", "desc"))
        const feedbackSnapshot = await getDocs(feedbackQuery)
        const feedbackData: BetaFeedback[] = []

        feedbackSnapshot.forEach((doc) => {
          feedbackData.push({
            id: doc.id,
            ...doc.data(),
          } as BetaFeedback)
        })

        setFeedback(feedbackData)
      } catch (error) {
        console.error("Error loading data:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load beta program data.",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const approveApplication = async (application: BetaApplication) => {
    setProcessingId(application.id)

    try {
      // Generate invite code
      const inviteCode = generateInviteCode()

      // Update application status
      await updateDoc(doc(db, "betaApplications", application.id), {
        status: "approved",
        inviteCode,
        approvedAt: new Date().toISOString(),
      })

      // Update local state
      setApplications(applications.map((app) => (app.id === application.id ? { ...app, status: "approved" } : app)))

      // Generate email template
      const emailContent = BetaInvitationEmail({
        name: application.name,
        inviteCode,
      })
      setEmailTemplate(emailContent)

      toast({
        title: "Application approved",
        description: `Invite code generated for ${application.name}.`,
      })
    } catch (error) {
      console.error("Error approving application:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve application.",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const rejectApplication = async (application: BetaApplication) => {
    setProcessingId(application.id)

    try {
      // Update application status
      await updateDoc(doc(db, "betaApplications", application.id), {
        status: "rejected",
        rejectedAt: new Date().toISOString(),
      })

      // Update local state
      setApplications(applications.map((app) => (app.id === application.id ? { ...app, status: "rejected" } : app)))

      toast({
        title: "Application rejected",
        description: `${application.name}'s application has been rejected.`,
      })
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject application.",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const updateFeedbackStatus = async (feedback: BetaFeedback, newStatus: "in-progress" | "completed" | "rejected") => {
    setProcessingId(feedback.id)

    try {
      // Update feedback status
      await updateDoc(doc(db, "betaFeedback", feedback.id), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })

      // Update local state
      setFeedback(feedback.map((item) => (item.id === feedback.id ? { ...item, status: newStatus } : item)))

      toast({
        title: "Feedback updated",
        description: `Feedback status updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating feedback:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update feedback status.",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const generateInviteCode = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const filteredApplications = applications.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredFeedback = feedback.filter(
    (item) =>
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="flex items-center justify-center h-40">Loading beta admin dashboard...</div>
  }

  return (
    <div className="container py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Beta Program Administration</h1>
      <p className="text-muted-foreground mb-8">Manage beta applications, feedback, and program settings.</p>

      <div className="mb-6">
        <Input
          placeholder="Search by name, email, or content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="applications" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="stats">Program Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Beta Applications</CardTitle>
              <CardDescription>Review and manage beta tester applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.name}</TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.experience}</TableCell>
                        <TableCell>{application.availability} hrs/week</TableCell>
                        <TableCell>{new Date(application.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {application.status === "pending" ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Pending
                            </Badge>
                          ) : application.status === "approved" ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {application.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveApplication(application)}
                                disabled={processingId === application.id}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectApplication(application)}
                                disabled={processingId === application.id}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {application.status !== "pending" && (
                            <Button size="sm" variant="outline" onClick={() => {}}>
                              View Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {emailTemplate && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Email Template</CardTitle>
                <CardDescription>Copy this email template to send to the approved applicant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  <pre className="text-xs">{emailTemplate}</pre>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setEmailTemplate(null)}>Close</Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Beta Feedback</CardTitle>
              <CardDescription>Review and manage feedback from beta testers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        No feedback found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFeedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.userName}</TableCell>
                        <TableCell>
                          {item.type === "bug" ? (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Bug
                            </Badge>
                          ) : item.type === "suggestion" ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              Suggestion
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                              Feedback
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.content}</TableCell>
                        <TableCell>{item.createdAt?.toDate().toLocaleDateString() || "Unknown"}</TableCell>
                        <TableCell>
                          {item.status === "pending" ? (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Pending
                            </Badge>
                          ) : item.status === "in-progress" ? (
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                              In Progress
                            </Badge>
                          ) : item.status === "completed" ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                              Rejected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={item.status === "in-progress" ? "default" : "outline"}
                              onClick={() => updateFeedbackStatus(item, "in-progress")}
                              disabled={processingId === item.id || item.status === "in-progress"}
                            >
                              In Progress
                            </Button>
                            <Button
                              size="sm"
                              variant={item.status === "completed" ? "default" : "outline"}
                              onClick={() => updateFeedbackStatus(item, "completed")}
                              disabled={processingId === item.id || item.status === "completed"}
                            >
                              Complete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Approved Testers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-500">
                  {applications.filter((app) => app.status === "approved").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-amber-500">
                  {applications.filter((app) => app.status === "pending").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-blue-500">{feedback.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Bugs</span>
                      <span>{feedback.filter((item) => item.type === "bug").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.type === "bug").length / feedback.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Suggestions</span>
                      <span>{feedback.filter((item) => item.type === "suggestion").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.type === "suggestion").length / feedback.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>General Feedback</span>
                      <span>{feedback.filter((item) => item.type === "general").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.type === "general").length / feedback.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Pending</span>
                      <span>{feedback.filter((item) => item.status === "pending").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-amber-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.status === "pending").length / feedback.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>In Progress</span>
                      <span>{feedback.filter((item) => item.status === "in-progress").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.status === "in-progress").length / feedback.length) * 100 ||
                            0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Completed</span>
                      <span>{feedback.filter((item) => item.status === "completed").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.status === "completed").length / feedback.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Rejected</span>
                      <span>{feedback.filter((item) => item.status === "rejected").length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-red-500 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (feedback.filter((item) => item.status === "rejected").length / feedback.length) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
