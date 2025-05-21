"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFirebaseError } from "@/hooks/use-firebase-error"
import { useAuth } from "@/lib/auth-context"
import { useFirestore } from "@/hooks/use-firestore"
import { useStorage } from "@/hooks/use-storage"
import { AlertCircle, CheckCircle, Info, Upload } from "lucide-react"

export function ErrorHandlingDemo() {
  const [activeTab, setActiveTab] = useState("auth")
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [docId, setDocId] = useState("test-document")
  const [docData, setDocData] = useState('{"name": "Test Document", "value": 123}')
  const [filePath, setFilePath] = useState("test-file.txt")
  const [fileContent, setFileContent] = useState("Test file content")
  const [result, setResult] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  const { handleError, clearError, error } = useFirebaseError()
  const { signInWithEmail, signUp } = useAuth()
  const usersCollection = useFirestore("users")
  const storage = useStorage("test-files")

  // Auth error demo
  const triggerAuthError = async () => {
    setResult(null)
    setSuccess(false)
    clearError()

    try {
      // Try to sign in with invalid credentials
      const result = await signInWithEmail(email, password)
      setResult(result)
      setSuccess(true)
    } catch (err) {
      setResult(err)
      // Error is already handled by the useAuth hook
    }
  }

  // Firestore error demo
  const triggerFirestoreError = async () => {
    setResult(null)
    setSuccess(false)
    clearError()

    try {
      // Try to access a document with invalid permissions
      let data
      try {
        data = JSON.parse(docData)
      } catch (err) {
        handleError(new Error("Invalid JSON data"), { operation: "parse-json" })
        return
      }

      await usersCollection.setDocument(docId, data)
      setResult({ message: "Document created/updated successfully" })
      setSuccess(true)
    } catch (err) {
      setResult(err)
      // Error is already handled by the useFirestore hook
    }
  }

  // Storage error demo
  const triggerStorageError = async () => {
    setResult(null)
    setSuccess(false)
    clearError()

    try {
      // Create a file from the content
      const file = new Blob([fileContent], { type: "text/plain" })

      // Upload the file
      const url = await storage.uploadFile(filePath, file)
      setResult({ url })
      setSuccess(true)
    } catch (err) {
      setResult(err)
      // Error is already handled by the useStorage hook
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Firebase Error Handling Demo</CardTitle>
        <CardDescription>Test the error handling system with different Firebase operations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="firestore">Firestore</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="auth" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={triggerAuthError}>Test Sign In</Button>
              <Button
                variant="outline"
                onClick={() => {
                  signUp(email, password, "Test User").catch(() => {})
                }}
              >
                Test Sign Up
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="firestore" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="docId">Document ID</Label>
              <Input
                id="docId"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                placeholder="Enter document ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docData">Document Data (JSON)</Label>
              <textarea
                id="docData"
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={docData}
                onChange={(e) => setDocData(e.target.value)}
                placeholder="Enter JSON data"
              />
            </div>
            <Button onClick={triggerFirestoreError}>Test Firestore Operation</Button>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="filePath">File Path</Label>
              <Input
                id="filePath"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="Enter file path"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fileContent">File Content</Label>
              <textarea
                id="fileContent"
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Enter file content"
              />
            </div>
            <Button onClick={triggerStorageError}>
              <Upload className="mr-2 h-4 w-4" />
              Test File Upload
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.userMessage}
              {process.env.NODE_ENV !== "production" && (
                <div className="mt-2 text-xs opacity-80 font-mono">
                  Code: {error.code}
                  <br />
                  Message: {error.message}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Operation completed successfully!
              {result && result.url && (
                <div className="mt-2">
                  <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View uploaded file
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {result && !success && !error && (
          <Alert className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Result</AlertTitle>
            <AlertDescription>
              <pre className="text-xs mt-2 p-2 bg-blue-100 rounded overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            clearError()
            setResult(null)
            setSuccess(false)
          }}
        >
          Clear Results
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            if (activeTab === "auth") {
              setEmail("test@example.com")
              setPassword("password123")
            } else if (activeTab === "firestore") {
              setDocId("test-document")
              setDocData('{"name": "Test Document", "value": 123}')
            } else if (activeTab === "storage") {
              setFilePath("test-file.txt")
              setFileContent("Test file content")
            }
          }}
        >
          Reset Form
        </Button>
      </CardFooter>
    </Card>
  )
}
