"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OnboardingABTestSetup } from "@/components/admin/onboarding-ab-test-setup"
import { abTestingService } from "@/lib/ab-testing-service"
import { ABTestResults } from "@/components/admin/ab-test-results"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OnboardingABTestPage() {
  const [test, setTest] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTest = async () => {
      try {
        setIsLoading(true)
        const tests = await abTestingService.getAllTests()
        const onboardingTest = tests.find((t) => t.id === "onboarding-experience")
        setTest(onboardingTest || null)
      } catch (error) {
        console.error("Error loading test:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTest()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/admin/ab-testing">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to A/B Tests
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Onboarding Experience A/B Test</h1>

      <Tabs defaultValue="setup">
        <TabsList className="mb-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="results" disabled={!test}>
            Results
          </TabsTrigger>
          <TabsTrigger value="analytics" disabled={!test}>
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <OnboardingABTestSetup />
        </TabsContent>

        <TabsContent value="results">
          {test ? (
            <ABTestResults test={test} />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No test data available. Please set up the test first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          {test ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate</CardTitle>
                  <CardDescription>Percentage of users who complete onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here when data is available</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Time to Complete</CardTitle>
                  <CardDescription>Average time spent in onboarding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here when data is available</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Engagement</CardTitle>
                  <CardDescription>Post-onboarding activity by variant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here when data is available</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Retention Impact</CardTitle>
                  <CardDescription>7-day retention by onboarding variant</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-muted-foreground">Chart will appear here when data is available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p>No analytics available. Please set up the test first.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
