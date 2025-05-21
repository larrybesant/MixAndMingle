"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

// Import from our safe files
import * as clientSafe from "@/lib/firebase-client-safe"

export function FirebaseImportChecker() {
  const [clientStatus, setClientStatus] = useState<"checking" | "success" | "error">("checking")
  const [clientMessage, setClientMessage] = useState("")

  useEffect(() => {
    // Check client imports
    try {
      const requiredClientExports = ["app", "auth", "db", "storage", "goOnline", "goOffline", "Timestamp", "FieldValue"]

      const missingClientExports = requiredClientExports.filter((exp) => !(exp in clientSafe))

      if (missingClientExports.length > 0) {
        setClientStatus("error")
        setClientMessage(`Missing exports in firebase-client-safe.ts: ${missingClientExports.join(", ")}`)
      } else {
        setClientStatus("success")
        setClientMessage("All required client exports are available")
      }
    } catch (error) {
      setClientStatus("error")
      setClientMessage(`Error checking client imports: ${(error as Error).message}`)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Import Checker</CardTitle>
        <CardDescription>Verifies that all required Firebase exports are available</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Client Imports</h3>
          {clientStatus === "checking" ? (
            <p>Checking client imports...</p>
          ) : clientStatus === "success" ? (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>{clientMessage}</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{clientMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
