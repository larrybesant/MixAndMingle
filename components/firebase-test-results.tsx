"use client"

import { useState } from "react"
import { FirebaseVerification, type TestResult } from "@/lib/firebase-verification"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FirebaseTestResults() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<"pending" | "success" | "error" | "idle">("idle")

  const runTests = async () => {
    setIsRunning(true)
    setOverallStatus("pending")

    const verification = new FirebaseVerification()
    setResults(verification.getResults())

    // Set up a listener for results updates
    const resultsListener = (updatedResults: TestResult[]) => {
      setResults([...updatedResults])
    }

    // Run the tests
    try {
      await verification.runAllTests()

      // Check overall status
      const hasErrors = verification.getResults().some((result) => result.status === "error")
      setOverallStatus(hasErrors ? "error" : "success")
    } catch (error) {
      console.error("Error running tests:", error)
      setOverallStatus("error")
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusIcon = (status: "success" | "error" | "pending") => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: "success" | "error" | "pending") => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Success</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Error</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Firebase Import Verification
          {overallStatus !== "idle" && (
            <Badge
              className={`ml-2 ${
                overallStatus === "success"
                  ? "bg-green-100 text-green-800"
                  : overallStatus === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {overallStatus === "success"
                ? "All Tests Passed"
                : overallStatus === "error"
                  ? "Some Tests Failed"
                  : "Running Tests"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Verifies that all Firebase imports are working correctly in your application</CardDescription>
      </CardHeader>
      <CardContent>
        {overallStatus === "idle" ? (
          <Alert>
            <AlertTitle>Ready to Test</AlertTitle>
            <AlertDescription>
              Click the "Run Tests" button below to verify your Firebase imports and functionality.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <Accordion type="multiple" className="w-full">
              {results.map((result) => (
                <AccordionItem key={result.name} value={result.name}>
                  <AccordionTrigger className="flex items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span>{result.name}</span>
                      {getStatusBadge(result.status)}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 bg-muted rounded-md">
                      <p className="font-medium">{result.message}</p>
                      {result.details && <p className="text-sm mt-2 text-muted-foreground">{result.details}</p>}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            "Run Tests"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
