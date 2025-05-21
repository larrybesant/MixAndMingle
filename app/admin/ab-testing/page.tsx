"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Play, Pause, CheckCircle } from "lucide-react"
import { ABTestForm } from "@/components/admin/ab-test-form"
import { ABTestResults } from "@/components/admin/ab-test-results"
import { abTestingService, type ABTest } from "@/lib/ab-testing-service"
import Link from "next/link"

export default function ABTestingAdminPage() {
  const [tests, setTests] = useState<ABTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTest, setEditingTest] = useState<ABTest | null>(null)

  useEffect(() => {
    const loadTests = async () => {
      try {
        const allTests = await abTestingService.getAllTests()
        setTests(allTests)
      } catch (error) {
        console.error("Error loading tests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTests()
  }, [])

  const handleCreateTest = () => {
    setEditingTest(null)
    setShowForm(true)
  }

  const handleEditTest = (test: ABTest) => {
    setEditingTest(test)
    setShowForm(true)
  }

  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test? This action cannot be undone.")) {
      return
    }

    try {
      await abTestingService.deleteTest(id)
      setTests(tests.filter((test) => test.id !== id))
    } catch (error) {
      console.error("Error deleting test:", error)
      alert("Failed to delete test. Please try again.")
    }
  }

  const handleUpdateStatus = async (id: string, status: ABTest["status"]) => {
    try {
      await abTestingService.updateTest(id, { status })
      setTests(tests.map((test) => (test.id === id ? { ...test, status } : test)))
    } catch (error) {
      console.error("Error updating test status:", error)
      alert("Failed to update test status. Please try again.")
    }
  }

  const handleSaveTest = (test: ABTest) => {
    if (editingTest) {
      setTests(tests.map((t) => (t.id === test.id ? test : t)))
    } else {
      setTests([...tests, test])
    }
    setShowForm(false)
    setEditingTest(null)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingTest(null)
  }

  const getStatusBadgeVariant = (status: ABTest["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "draft":
        return "outline"
      case "paused":
        return "secondary"
      case "completed":
        return "success"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (showForm) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">{editingTest ? "Edit A/B Test" : "Create A/B Test"}</h1>
        <ABTestForm initialTest={editingTest || undefined} onSave={handleSaveTest} onCancel={handleCancelForm} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">A/B Testing Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <Link href="/admin/ab-testing/onboarding">
            <Button variant="outline">Onboarding Experience Test</Button>
          </Link>
        </div>
        <Button onClick={handleCreateTest}>
          <Plus className="h-4 w-4 mr-1" /> Create Test
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {["all", "active", "draft", "completed", "paused"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 gap-4">
              {tests
                .filter((test) => tab === "all" || test.status === tab)
                .map((test) => (
                  <Card key={test.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {test.name}
                            <Badge variant={getStatusBadgeVariant(test.status)}>
                              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                            </Badge>
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {test.description || "No description provided"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {test.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(test.id, "active")}>
                              <Play className="h-4 w-4 mr-1" /> Start
                            </Button>
                          )}
                          {test.status === "active" && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(test.id, "paused")}>
                                <Pause className="h-4 w-4 mr-1" /> Pause
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(test.id, "completed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Complete
                              </Button>
                            </>
                          )}
                          {test.status === "paused" && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(test.id, "active")}>
                              <Play className="h-4 w-4 mr-1" /> Resume
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleEditTest(test)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTest(test.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Variants</h3>
                        <div className="flex flex-wrap gap-2">
                          {test.variants.map((variant) => (
                            <Badge key={variant.id} variant="outline">
                              {variant.name} ({variant.weight}%)
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {test.results && Object.keys(test.results).length > 0 && (
                        <div className="mt-4">
                          <ABTestResults test={test} />
                          <div className="mt-4 text-center">
                            <Link href={`/admin/ab-testing/${test.id}`}>
                              <Button variant="link">View Detailed Results</Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

              {tests.filter((test) => tab === "all" || test.status === tab).length === 0 && (
                <div className="text-center p-8 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No {tab === "all" ? "" : tab} tests found.</p>
                  <Button variant="link" onClick={handleCreateTest}>
                    Create your first test
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
