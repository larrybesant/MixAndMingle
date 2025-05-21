"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function FirebaseConfigChecker() {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Check Firebase environment variables
    const requiredVars = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ]

    const configValues: Record<string, any> = {}
    const missingVars: string[] = []

    requiredVars.forEach((varName) => {
      const value = process.env[varName]
      configValues[varName] = value ? "✓ Configured" : "✗ Missing"
      if (!value) missingVars.push(varName)
    })

    // Check for crypto polyfill
    let cryptoStatus = "unknown"
    try {
      // Try to access the crypto object
      if (typeof window !== "undefined") {
        if (window.crypto) {
          cryptoStatus = "native"
        }
      }

      // Try to require crypto (this will use the polyfill in browser)
      try {
        require("crypto")
        cryptoStatus = cryptoStatus === "native" ? "both" : "polyfill"
      } catch (e) {
        if (cryptoStatus !== "native") {
          cryptoStatus = "missing"
        }
      }
    } catch (e) {
      cryptoStatus = "error"
    }

    configValues["crypto"] = cryptoStatus

    // Set overall status
    if (missingVars.length > 0) {
      setStatus("error")
      setMessage(`Missing required Firebase configuration: ${missingVars.join(", ")}`)
    } else if (cryptoStatus === "missing" || cryptoStatus === "error") {
      setStatus("error")
      setMessage("Crypto polyfill is not properly configured")
    } else if (cryptoStatus === "native") {
      setStatus("warning")
      setMessage("Using native crypto only, polyfill not detected")
    } else {
      setStatus("success")
      setMessage(
        cryptoStatus === "both"
          ? "Firebase configuration complete with both native and polyfill crypto"
          : "Firebase configuration complete with crypto polyfill",
      )
    }

    setConfig(configValues)
  }, [])

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Firebase Configuration Status</CardTitle>
            <CardDescription>{message}</CardDescription>
          </div>
          <Badge
            variant={
              status === "success"
                ? "success"
                : status === "warning"
                  ? "warning"
                  : status === "error"
                    ? "destructive"
                    : "outline"
            }
            className="ml-2"
          >
            {status === "loading" && "Checking..."}
            {status === "success" && "Configured"}
            {status === "warning" && "Warning"}
            {status === "error" && "Error"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between border p-3 rounded">
              <span className="font-medium">{key}</span>
              <span className="flex items-center">
                {typeof value === "string" && value.startsWith("✓") && (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                )}
                {typeof value === "string" && value.startsWith("✗") && (
                  <XCircle className="h-4 w-4 text-red-500 mr-1" />
                )}
                {key === "crypto" && (
                  <>
                    {value === "both" && <CheckCircle className="h-4 w-4 text-green-500 mr-1" />}
                    {value === "native" && <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />}
                    {value === "polyfill" && <CheckCircle className="h-4 w-4 text-green-500 mr-1" />}
                    {value === "missing" && <XCircle className="h-4 w-4 text-red-500 mr-1" />}
                    {value === "error" && <XCircle className="h-4 w-4 text-red-500 mr-1" />}
                    {value === "both" && "Native + Polyfill"}
                    {value === "native" && "Native Only"}
                    {value === "polyfill" && "Polyfill Only"}
                    {value === "missing" && "Missing"}
                    {value === "error" && "Error"}
                  </>
                )}
                {key !== "crypto" && value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
