"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"

export default function AuthDebugPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const [configData, setConfigData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runDiagnostic = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/diagnostic")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to run diagnostic")
      }

      setDiagnosticData(data)
    } catch (err: any) {
      console.error("Diagnostic error:", err)
      setError(err.message || "An error occurred while running the diagnostic")
    } finally {
      setLoading(false)
    }
  }

  const verifyConfig = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/verify-config")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify configuration")
      }

      setConfigData(data)
    } catch (err: any) {
      console.error("Config verification error:", err)
      setError(err.message || "An error occurred while verifying configuration")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostic()
    verifyConfig()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Authentication Debugging</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>User Authenticated:</span>
                <span className="font-medium">{user ? "Yes" : "No"}</span>
              </div>
              {user && (
                <>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-medium">{user.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email Verified:</span>
                    <span className="font-medium">{user.emailVerified ? "Yes" : "No"}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firebase Config</CardTitle>
            <CardDescription>Firebase configuration status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !configData ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : configData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Config Status:</span>
                  <span
                    className={`font-medium ${configData.configStatus === "complete" ? "text-green-600" : "text-red-600"}`}
                  >
                    {configData.configStatus === "complete" ? "Complete" : "Incomplete"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Firebase Admin:</span>
                  <span
                    className={`font-medium ${configData.firebaseAdmin.initialized ? "text-green-600" : "text-red-600"}`}
                  >
                    {configData.firebaseAdmin.initialized ? "Initialized" : "Failed"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Status:</span>
                  <span
                    className={`font-medium ${
                      configData.firebaseAdmin.authStatus === "functional" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {configData.firebaseAdmin.authStatus === "functional"
                      ? "Functional"
                      : configData.firebaseAdmin.authStatus === "error"
                        ? "Error"
                        : "Failed"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No configuration data available</div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full" onClick={verifyConfig} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verify Configuration
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment</CardTitle>
            <CardDescription>Application environment details</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !diagnosticData ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : diagnosticData ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-medium">{diagnosticData.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>App URL:</span>
                  <span className="font-medium">{diagnosticData.nextPublicAppUrl || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span>App Version:</span>
                  <span className="font-medium">{diagnosticData.nextVersion || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-medium">{new Date(diagnosticData.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No diagnostic data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="diagnostic">
        <TabsList className="mb-4">
          <TabsTrigger value="diagnostic">Diagnostic Data</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="actions">Fix Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostic">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Results</CardTitle>
              <CardDescription>Detailed diagnostic information</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !diagnosticData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : diagnosticData ? (
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(diagnosticData, null, 2)}
                </pre>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No diagnostic data available</div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={runDiagnostic} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Diagnostic...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Run Diagnostic
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration Details</CardTitle>
              <CardDescription>Firebase and environment configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !configData ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : configData ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      {configData.missingEnvVars.length > 0 ? (
                        configData.missingEnvVars.map((varName: string) => (
                          <div key={varName} className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>{varName} - Missing</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center text-green-600 col-span-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span>All required environment variables are set</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">Firebase Admin</h3>
                  <div className="mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        {configData.firebaseAdmin.initialized ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                        )}
                        <span>
                          Firebase Admin Initialization: {configData.firebaseAdmin.initialized ? "Success" : "Failed"}
                        </span>
                      </div>

                      {configData.firebaseAdmin.error && (
                        <div className="ml-6 text-red-600">Error: {configData.firebaseAdmin.error}</div>
                      )}

                      <div className="flex items-center">
                        {configData.firebaseAdmin.authStatus === "functional" ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                        )}
                        <span>
                          Firebase Auth:{" "}
                          {configData.firebaseAdmin.authStatus === "functional"
                            ? "Functional"
                            : configData.firebaseAdmin.authStatus === "error"
                              ? "Error"
                              : "Failed"}
                        </span>
                      </div>

                      {configData.firebaseAdmin.testError && (
                        <div className="ml-6 text-red-600">Error: {configData.firebaseAdmin.testError}</div>
                      )}
                    </div>
                  </div>

                  {process.env.NODE_ENV === "development" && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">User Sample</h3>
                      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-48">
                        {JSON.stringify(configData.userSample, null, 2)}
                      </pre>
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No configuration data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Fix Actions</CardTitle>
              <CardDescription>Actions to fix authentication issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    These actions can modify your authentication system. Use with caution.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Verify Firebase Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Check if Firebase is properly configured and environment variables are set correctly.
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" onClick={verifyConfig} disabled={loading}>
                        Verify Configuration
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Test Authentication Routes</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">Test if authentication routes are working properly.</CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open("/login", "_blank")}
                      >
                        Test Login Page
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Test Forgot Password</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">Test if the forgot password functionality is working.</CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open("/forgot-password", "_blank")}
                      >
                        Test Forgot Password
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Clear Browser Data</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      Clear local storage and cookies to reset authentication state in the browser.
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          localStorage.clear()
                          sessionStorage.clear()
                          alert("Browser storage cleared. You may need to refresh the page.")
                        }}
                      >
                        Clear Browser Data
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
