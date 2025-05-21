"use client"

import { useState, useEffect } from "react"
import { auth, db, storage } from "@/lib/firebase-client"
import { collection, addDoc, getDocs } from "firebase/firestore"
import { ref, uploadString, getDownloadURL } from "firebase/storage"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function EmulatorTest() {
  const [isUsingEmulators, setIsUsingEmulators] = useState<boolean>(false)
  const [authStatus, setAuthStatus] = useState<"idle" | "success" | "error">("idle")
  const [firestoreStatus, setFirestoreStatus] = useState<"idle" | "success" | "error">("idle")
  const [storageStatus, setStorageStatus] = useState<"idle" | "success" | "error">("idle")
  const [authMessage, setAuthMessage] = useState<string>("")
  const [firestoreMessage, setFirestoreMessage] = useState<string>("")
  const [storageMessage, setStorageMessage] = useState<string>("")
  const [email, setEmail] = useState<string>("test@example.com")
  const [password, setPassword] = useState<string>("password123")

  useEffect(() => {
    setIsUsingEmulators(process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true")
  }, [])

  const testAuth = async () => {
    try {
      setAuthStatus("idle")
      setAuthMessage("Testing authentication...")

      // Create a test user
      await createUserWithEmailAndPassword(auth, email, password)
      setAuthMessage("User created successfully. Attempting to sign in...")

      // Sign in with the test user
      await signInWithEmailAndPassword(auth, email, password)
      setAuthMessage("Sign in successful. Signing out...")

      // Sign out
      await signOut(auth)
      setAuthMessage("Authentication test completed successfully!")
      setAuthStatus("success")
    } catch (error: any) {
      console.error("Auth test error:", error)
      setAuthMessage(`Authentication test failed: ${error.message}`)
      setAuthStatus("error")
    }
  }

  const testFirestore = async () => {
    try {
      setFirestoreStatus("idle")
      setFirestoreMessage("Testing Firestore...")

      // Add a test document
      const docRef = await addDoc(collection(db, "emulator-test"), {
        message: "Hello from emulator!",
        timestamp: new Date(),
      })
      setFirestoreMessage(`Document added with ID: ${docRef.id}. Fetching documents...`)

      // Fetch documents
      const querySnapshot = await getDocs(collection(db, "emulator-test"))
      const docsCount = querySnapshot.size
      setFirestoreMessage(`Firestore test completed successfully! Found ${docsCount} document(s).`)
      setFirestoreStatus("success")
    } catch (error: any) {
      console.error("Firestore test error:", error)
      setFirestoreMessage(`Firestore test failed: ${error.message}`)
      setFirestoreStatus("error")
    }
  }

  const testStorage = async () => {
    try {
      setStorageStatus("idle")
      setStorageMessage("Testing Storage...")

      // Upload a test file
      const storageRef = ref(storage, "emulator-test/test-file.txt")
      await uploadString(storageRef, "Hello from emulator storage!")
      setStorageMessage("File uploaded successfully. Getting download URL...")

      // Get download URL
      const url = await getDownloadURL(storageRef)
      setStorageMessage(`Storage test completed successfully! URL: ${url}`)
      setStorageStatus("success")
    } catch (error: any) {
      console.error("Storage test error:", error)
      setStorageMessage(`Storage test failed: ${error.message}`)
      setStorageStatus("error")
    }
  }

  const renderStatusIcon = (status: "idle" | "success" | "error") => {
    if (status === "success") return <CheckCircle className="h-5 w-5 text-green-500" />
    if (status === "error") return <XCircle className="h-5 w-5 text-red-500" />
    return null
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Firebase Emulator Test
          {isUsingEmulators ? (
            <span className="text-sm font-normal bg-green-100 text-green-800 px-2 py-1 rounded">Emulators Enabled</span>
          ) : (
            <span className="text-sm font-normal bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Using Production
            </span>
          )}
        </CardTitle>
        <CardDescription>Test your Firebase emulators to ensure they're working correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isUsingEmulators && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              You are not using Firebase emulators. These tests will affect your production Firebase project.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Test Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="test@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Test Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Authentication</h3>
              {renderStatusIcon(authStatus)}
            </div>
            <Button onClick={testAuth} variant="outline">
              Test Auth
            </Button>
          </div>
          {authMessage && (
            <div
              className={`p-3 rounded text-sm ${
                authStatus === "success"
                  ? "bg-green-50 text-green-700"
                  : authStatus === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-700"
              }`}
            >
              {authMessage}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Firestore</h3>
              {renderStatusIcon(firestoreStatus)}
            </div>
            <Button onClick={testFirestore} variant="outline">
              Test Firestore
            </Button>
          </div>
          {firestoreMessage && (
            <div
              className={`p-3 rounded text-sm ${
                firestoreStatus === "success"
                  ? "bg-green-50 text-green-700"
                  : firestoreStatus === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-700"
              }`}
            >
              {firestoreMessage}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Storage</h3>
              {renderStatusIcon(storageStatus)}
            </div>
            <Button onClick={testStorage} variant="outline">
              Test Storage
            </Button>
          </div>
          {storageMessage && (
            <div
              className={`p-3 rounded text-sm ${
                storageStatus === "success"
                  ? "bg-green-50 text-green-700"
                  : storageStatus === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-gray-50 text-gray-700"
              }`}
            >
              {storageMessage}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.open("http://localhost:4000", "_blank")}>
          Open Emulator UI
        </Button>
        <Button
          variant="default"
          onClick={() => {
            testAuth()
            testFirestore()
            testStorage()
          }}
        >
          Run All Tests
        </Button>
      </CardFooter>
    </Card>
  )
}
