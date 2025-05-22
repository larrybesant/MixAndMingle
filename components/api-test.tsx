"use client"

import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

export function ApiTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await apiClient.get<any>("/test")
      setResult(data)
    } catch (err: any) {
      console.error("API test error:", err)
      setError(err.message || "Failed to connect to API")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>API Connection Test</CardTitle>
        <CardDescription>Test your API connection and configuration</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              <div>Status: {result.status}</div>
              <div>Message: {result.message}</div>
              <div>Timestamp: {result.timestamp}</div>
              <div>Environment: {result.environment}</div>
              {result.appUrl && <div>App URL: {result.appUrl}</div>}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground mb-4">
          <p>
            This component tests the connection to your API endpoint at <code>/api/test</code>.
          </p>
          <p>If successful, you'll see the API response details above.</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={testApi} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing API...
            </>
          ) : (
            "Test API Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
