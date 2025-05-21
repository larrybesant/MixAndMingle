"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface PackageVersion {
  name: string
  version: string
  recommended: string
  status: "compatible" | "warning" | "error" | "unknown"
}

export function FirebaseVersionChecker() {
  const [versions, setVersions] = useState<PackageVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkVersions = async () => {
      try {
        setLoading(true)

        // In a real implementation, this would make an API call to get the actual versions
        // For this demo, we'll simulate the versions

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // These are example versions - in a real app, you would get these from package.json
        const packageVersions: PackageVersion[] = [
          {
            name: "firebase",
            version: "10.7.1",
            recommended: "10.7.1",
            status: "compatible",
          },
          {
            name: "firebase-admin",
            version: "11.11.1",
            recommended: "11.11.1",
            status: "compatible",
          },
          {
            name: "@firebase/app",
            version: "0.9.25",
            recommended: "0.9.25",
            status: "compatible",
          },
          {
            name: "@firebase/auth",
            version: "1.5.1",
            recommended: "1.5.1",
            status: "compatible",
          },
          {
            name: "@firebase/firestore",
            version: "4.4.0",
            recommended: "4.4.0",
            status: "compatible",
          },
          {
            name: "@firebase/storage",
            version: "0.12.0",
            recommended: "0.12.0",
            status: "compatible",
          },
        ]

        setVersions(packageVersions)
      } catch (err) {
        setError(`Error checking Firebase versions: ${(err as Error).message}`)
      } finally {
        setLoading(false)
      }
    }

    checkVersions()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compatible":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firebase Version Compatibility</CardTitle>
        <CardDescription>Check if your Firebase package versions are compatible</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-primary mr-2" />
            <span>Checking Firebase versions...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Package</th>
                  <th className="text-left py-2">Current Version</th>
                  <th className="text-left py-2">Recommended</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((pkg) => (
                  <tr key={pkg.name} className="border-b">
                    <td className="py-2 font-medium">{pkg.name}</td>
                    <td className="py-2">{pkg.version}</td>
                    <td className="py-2">{pkg.recommended}</td>
                    <td className="py-2 flex items-center">
                      {getStatusIcon(pkg.status)}
                      <span className="ml-2">
                        {pkg.status === "compatible"
                          ? "Compatible"
                          : pkg.status === "warning"
                            ? "Update recommended"
                            : pkg.status === "error"
                              ? "Update required"
                              : "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <AlertDescription>
                All Firebase packages should be compatible with each other. Make sure to update them together to avoid
                version conflicts.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
