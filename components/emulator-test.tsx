"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { auth, db, storage } from "@/lib/firebase-client-safe"
import { collection, addDoc, getDocs, query, limit } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"

export function EmulatorTest() {
  const [firestoreStatus, setFirestoreStatus] = useState<"loading" | "success" | "error">("loading")
  const [authStatus, setAuthStatus] = useState<"loading" | "success" | "error">("loading")
  const [storageStatus, setStorageStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")

  // Test Firestore
  const testFirestore = async () => {
    setFirestoreStatus("loading")
    try {
      // Try to add a document
      const docRef = await addDoc(collection(db, "emulator-test"), {
        message: "Test message",
        timestamp: new Date(),
      })

      // Try to read documents
      const q = query(collection(db, "emulator-test"), limit(1))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.size > 0) {
        setFirestoreStatus("success")
        setMessage("Firestore emulator is working correctly!")
      } else {
        setFirestoreStatus("error")
        setMessage("Firestore emulator is running but no data was retrieved.")
      }
    } catch (error) {
      console.error("Firestore test error:", error)
      setFirestoreStatus("error")
      setMessage(`Firestore emulator error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Auth
  const testAuth = async () => {
    setAuthStatus("loading")
    try {
      // Create a test user
      const email = `test-${Date.now()}@example.com`
      const password = "Test123!"

      // Create user
      await createUserWithEmailAndPassword(auth, email, password)

      // Sign out
      await signOut(auth)

      // Sign in again
      await signInWithEmailAndPassword(auth, email, password)

      // Sign out again
      await signOut(auth)

      setAuthStatus("success")
      setMessage("Auth emulator is working correctly!")
    } catch (error) {
      console.error("Auth test error:", error)
      setAuthStatus("error")
      setMessage(`Auth emulator error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Test Storage
  const testStorage = async () => {
    setStorageStatus("loading")
    try {
      // Create a test file
      const storageRef = ref(storage, `test-${Date.now()}.txt`)

      // Upload string
      await uploadString(storageRef, "Hello, World!")

      // Get download URL
      const url = await getDownloadURL(storageRef)

      if (url) {
        setStorageStatus("success")
        setMessage("Storage emulator is working correctly!")
      } else {
        setStorageStatus("error")
        setMessage("Storage emulator is running but URL retrieval failed.")
      }
    } catch (error) {
      console.error("Storage test error:", error)
      setStorageStatus("error")
      setMessage(`Storage emulator error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Run all tests
  const runAllTests = () => {
    testFirestore()
    testAuth()
    testStorage()
  }

  // Status indicator component
  const StatusIndicator = ({ status }: { status: "loading" | "success" | "error" }) => {
    if (status === "loading") return <AlertCircle className="h-5 w-5 text-yellow-500" />
    if (status === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Firebase Emulator Test</CardTitle>
        <CardDescription>Test if your Firebase emulators are running correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Firestore Emulator</span>
          <StatusIndicator status={firestoreStatus} />
        </div>
        <div className="flex items-center justify-between">
          <span>Auth Emulator</span>
          <StatusIndicator status={authStatus} />
        </div>
        <div className="flex items-center justify-between">
          <span>Storage Emulator</span>
          <StatusIndicator status={storageStatus} />
        </div>

        {message && (
          <Alert
            variant={
              firestoreStatus === "error" || authStatus === "error" || storageStatus === "error"
                ? "destructive"
                : "default"
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={runAllTests}>
          Test All Emulators
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={testFirestore}>
            Test Firestore
          </Button>
          <Button variant="outline" onClick={testAuth}>
            Test Auth
          </Button>
          <Button variant="outline" onClick={testStorage}>
            Test Storage
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
