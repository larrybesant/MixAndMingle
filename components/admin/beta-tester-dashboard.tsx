"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BetaInviteGenerator } from "./beta-invite-generator"
import { BetaAnalyticsSummary } from "./beta-analytics-summary"
import { BetaEmailSender } from "./beta-email-sender"

interface BetaTester {
  id: string
  displayName: string
  email: string
  createdAt: any
  lastActive: any
  status: "active" | "inactive" | "pending"
  feedbackCount: number
  completedChallenges: number
  badges: string[]
  accessLevel: string
}

export function BetaTesterDashboard() {
  const [testers, setTesters] = useState<BetaTester[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTesters, setSelectedTesters] = useState<string[]>([])

  useEffect(() => {
    const fetchBetaTesters = async () => {
      try {
        const q = query(collection(db, "users"), where("isBetaTester", "==", true))
        const querySnapshot = await getDocs(q)

        const testersData: BetaTester[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          testersData.push({
            id: doc.id,
            displayName: data.displayName || "Anonymous Tester",
            email: data.email || "No email",
            createdAt: data.createdAt?.toDate() || new Date(),
            lastActive: data.lastActive?.toDate() || new Date(),
            status: data.betaStatus || "pending",
            feedbackCount: data.feedbackCount || 0,
            completedChallenges: data.completedChallenges || 0,
            badges: data.badges || [],
            accessLevel: data.betaAccessLevel || "standard",
          })
        })

        setTesters(testersData)
      } catch (error) {
        console.error("Error fetching beta testers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBetaTesters()
  }, [])

  const filteredTesters = testers.filter((tester) => {
    const matchesSearch =
      tester.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tester.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || tester.status === statusFilter

    return matchesSearch && matchesStatus
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

  const updateTesterStatus = async (status: "active" | "inactive" | "pending") => {
    try {
      for (const testerId of selectedTesters) {
        await updateDoc(doc(db, "users", testerId), {
          betaStatus: status,
          updatedAt: new Date(),
        })
      }

      setTesters((prev) => prev.map((tester) => (selectedTesters.includes(tester.id) ? { ...tester, status } : tester)))
    } catch (error) {
      console.error("Error updating tester status:", error)
    }
  }

  const removeBetaTesters = async () => {
    if (!confirm("Are you sure you want to remove these users from the beta program?")) return

    try {
      for (const testerId of selectedTesters) {
        await updateDoc(doc(db, "users", testerId), {
          isBetaTester: false,
          betaStatus: null,
          betaAccessLevel: null,
          updatedAt: new Date(),
        })
      }

      setTesters((prev) => prev.filter((tester) => !selectedTesters.includes(tester.id)))
      setSelectedTesters([])
    } catch (error) {
      console.error("Error removing beta testers:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <p className="text-center mt-4">Loading beta testers...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="testers">
      <TabsList className="mb-4">
        <TabsTrigger value="testers">Beta Testers</TabsTrigger>
        <TabsTrigger value="invites">Invitations</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
      </TabsList>

      <TabsContent value="testers">
        <Card>
          <CardHeader>
            <CardTitle>Beta Testers</CardTitle>
            <CardDescription>Manage users participating in your beta program</CardDescription>

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {filteredTesters.length > 0 ? (
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
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Feedback</TableHead>
                      <TableHead>Challenges</TableHead>
                      <TableHead>Access Level</TableHead>
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
                        <TableCell>{getStatusBadge(tester.status)}</TableCell>
                        <TableCell>{formatDate(tester.createdAt)}</TableCell>
                        <TableCell>{formatDate(tester.lastActive)}</TableCell>
                        <TableCell>{tester.feedbackCount}</TableCell>
                        <TableCell>{tester.completedChallenges}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {tester.accessLevel}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No beta testers found matching your filters</p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => updateTesterStatus("active")}
              disabled={selectedTesters.length === 0}
            >
              Set Active
            </Button>
            <Button
              variant="outline"
              onClick={() => updateTesterStatus("inactive")}
              disabled={selectedTesters.length === 0}
            >
              Set Inactive
            </Button>
            <Button variant="destructive" onClick={removeBetaTesters} disabled={selectedTesters.length === 0}>
              Remove from Beta
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              {selectedTesters.length} of {testers.length} selected
            </div>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="invites">
        <BetaInviteGenerator />
      </TabsContent>

      <TabsContent value="analytics">
        <BetaAnalyticsSummary />
      </TabsContent>

      <TabsContent value="email">
        <BetaEmailSender testers={testers} />
      </TabsContent>
    </Tabs>
  )
}
