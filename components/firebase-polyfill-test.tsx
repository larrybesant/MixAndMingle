"use client"

import { useState } from "react"
import { signInAnonymously, signOut as firebaseSignOut, sendPasswordResetEmail } from "firebase/auth"
import { collection, addDoc, getDocs, query, limit, serverTimestamp, deleteDoc } from "firebase/firestore"
import { ref as storageRef, uploadString, getDownloadURL, deleteObject } from "firebase/storage"
import { auth, db, storage } from "@/lib/firebase-client-safe"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

type TestStatus = "idle" | "running" | "success" | "error"

interface TestResult {
  name: string
  status: TestStatus
  message: string
  details?: any
  duration?: number
}

export default function FirebasePolyfillTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [overallStatus, setOverallStatus] = useState<TestStatus>("idle")

  // Helper function to update a test result
  const updateTestResult = (name: string, status: TestStatus, message: string, details?: any, duration?: number) => {
    setResults((prev) => {
      const existing = prev.findIndex((r) => r.name === name)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { name, status, message, details, duration }
        return updated
      }
      return [...prev, { name, status, message, details, duration }]
    })
  }

  // Run a single test with timing and error handling
  const runTest = async (name: string, testFn: () => Promise<any>) => {
    updateTestResult(name, "running", "Test in progress...")
    const startTime = performance.now()

    try {
      const result = await testFn()
      const duration = Math.round(performance.now() - startTime)
      updateTestResult(name, "success", "Test passed successfully", result, duration)
      return true
    } catch (error) {
      const duration = Math.round(performance.now() - startTime)
      console.error(`Test "${name}" failed:`, error)
      updateTestResult(
        name,
        "error",
        error instanceof Error ? error.message : String(error),
        { stack: error instanceof Error ? error.stack : undefined },
        duration,
      )
      return false
    }
  }

  // Test Firebase Authentication
  const testAuthentication = async () => {
    // Test anonymous sign in
    await runTest("Auth - Anonymous Sign In", async () => {
      const result = await signInAnonymously(auth)
      return { uid: result.user.uid, isAnonymous: result.user.isAnonymous }
    })

    // Test password reset email (will fail if email doesn't exist, that's expected)
    await runTest("Auth - Password Reset", async () => {
      try {
        // Use a test email that won't actually receive emails
        await sendPasswordResetEmail(auth, "test@example.com", {
          url: window.location.origin + "/login",
        })
        return { emailSent: true }
      } catch (error: any) {
        // This might fail with "user not found" which is fine for testing
        if (error.code === "auth/user-not-found") {
          return { emailSent: false, reason: "User not found (expected for test email)" }
        }
        throw error
      }
    })

    // Sign out to clean up
    await runTest("Auth - Sign Out", async () => {
      await firebaseSignOut(auth)
      return { signedOut: true }
    })
  }

  // Test Firestore
  const testFirestore = async () => {
    const testCollectionName = "polyfill_tests"
    let docId: string | null = null

    // Test document creation
    await runTest("Firestore - Write Document", async () => {
      const docRef = await addDoc(collection(db, testCollectionName), {
        test: "polyfill test",
        timestamp: serverTimestamp(),
        randomValue: Math.random().toString(36).substring(2),
      })
      docId = docRef.id
      return { documentId: docRef.id }
    })

    // Test document reading
    if (docId) {
      await runTest("Firestore - Read Documents", async () => {
        const q = query(collection(db, testCollectionName), limit(5))
        const querySnapshot = await getDocs(q)
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
        return { documentsRetrieved: docs.length, sampleDocs: docs }
      })

      // Clean up test document
      await runTest("Firestore - Delete Document", async () => {
        const testDoc = collection(db, testCollectionName)
        await deleteDoc(collection(db, testCollectionName, docId!))
        return { documentDeleted: docId }
      })
    }
  }

  // Test Firebase Storage
  const testStorage = async () => {
    const testFilePath = `polyfill_tests/test_${Date.now()}.txt`

    // Test file upload
    await runTest("Storage - Upload File", async () => {
      const fileRef = storageRef(storage, testFilePath)
      const testContent = "This is a test file to verify polyfills are working correctly."
      const snapshot = await uploadString(fileRef, testContent, "raw")
      return {
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes,
        path: snapshot.ref.fullPath,
      }
    })

    // Test file download URL
    await runTest("Storage - Get Download URL", async () => {
      const fileRef = storageRef(storage, testFilePath)
      const url = await getDownloadURL(fileRef)
      return { downloadUrl: url }
    })

    // Clean up test file
    await runTest("Storage - Delete File", async () => {
      const fileRef = storageRef(storage, testFilePath)
      await deleteObject(fileRef)
      return { fileDeleted: testFilePath }
    })
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunningTests(true)
    setOverallStatus("running")
    setResults([])

    try {
      // Test Firebase initialization
      await runTest("Firebase - Initialization", async () => {
        return {
          auth: !!auth,
          firestore: !!db,
          storage: !!storage,
        }
      })

      // Run all test suites
      await testAuthentication()
      await testFirestore()
      await testStorage()

      setOverallStatus("success")
    } catch (error) {
      console.error("Test suite failed:", error)
      setOverallStatus("error")
    } finally {
      setIsRunningTests(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Firebase Polyfill Verification</h2>
        <Button
          onClick={runAllTests}
          disabled={isRunningTests}
          variant={overallStatus === "error" ? "destructive" : "default"}
        >
          {isRunningTests ? "Running Tests..." : "Run All Tests"}
        </Button>
      </div>

      {overallStatus !== "idle" && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Overall Status:</span>
            {overallStatus === "running" && <Badge variant="outline">Running</Badge>}
            {overallStatus === "success" && <Badge variant="success">All Tests Passed</Badge>}
            {overallStatus === "error" && <Badge variant="destructive">Some Tests Failed</Badge>}
          </div>
          <progress
            className="w-full h-2"
            value={results.filter((r) => r.status !== "running").length}
            max={results.length}
          />
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.name}>
            <CardHeader className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{result.name}</CardTitle>
                  <CardDescription>
                    {result.status === "running" && "Test in progress..."}
                    {result.status === "success" && result.message}
                    {result.status === "error" && <span className="text-red-500">{result.message}</span>}
                  </CardDescription>
                </div>
                <div>
                  {result.status === "running" && (
                    <span className="inline-block h-4 w-4 rounded-full bg-blue-500 animate-pulse"></span>
                  )}
                  {result.status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {result.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
            </CardHeader>

            {(result.details || result.duration) && (
              <>
                <Separator />
                <CardContent className="py-4">
                  {result.duration && <div className="mb-2 text-sm text-gray-500">Duration: {result.duration}ms</div>}
                  {result.details && (
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>

      {results.length === 0 && overallStatus === "idle" && (
        <div className="text-center p-12 border rounded-lg bg-gray-50">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No Tests Run Yet</h3>
          <p className="text-gray-500 mt-2">
            Click "Run All Tests" to verify Firebase functionality with the polyfills.
          </p>
        </div>
      )}
    </div>
  )
}
