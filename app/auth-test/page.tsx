"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { auth } from "@/lib/firebase-client-safe" // Updated import
import { signInWithEmailAndPassword, signInAnonymously, signOut } from "firebase/auth"
import { GoogleAuthTest } from "@/components/google-auth-test"

export default function AuthTestPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(auth.currentUser)

  const handleEmailSignIn = async () => {
    try {
      setError(null)
      setResult(null)

      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      setResult({
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
        },
      })
      setUser(userCredential.user)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleAnonymousSignIn = async () => {
    try {
      setError(null)
      setResult(null)

      const userCredential = await signInAnonymously(auth)
      setResult({
        user: {
          uid: userCredential.user.uid,
          isAnonymous: userCredential.user.isAnonymous,
        },
      })
      setUser(userCredential.user)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      await signOut(auth)
      setResult({ message: "Signed out successfully" })
      setUser(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const checkAuthState = () => {
    setUser(auth.currentUser)
    setResult({
      message: "Auth state checked",
      currentUser: auth.currentUser
        ? {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            displayName: auth.currentUser.displayName,
            isAnonymous: auth.currentUser.isAnonymous,
          }
        : null,
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Authentication Test Page</h1>
        <p className="text-muted-foreground mt-2">Use this page to test various authentication methods</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if required environment variables are set</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <span className="font-medium">NEXT_PUBLIC_FIREBASE_API_KEY:</span>{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:</span>{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">GOOGLE_CLIENT_ID:</span>{" "}
                {process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">GOOGLE_CLIENT_SECRET:</span>{" "}
                {process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing"}
              </li>
            </ul>
          </CardContent>
        </Card>

        <GoogleAuthTest />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Sign In</CardTitle>
            <CardDescription>Test email/password authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleEmailSignIn}>Sign In with Email</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Other Auth Methods</CardTitle>
            <CardDescription>Test alternative authentication methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleAnonymousSignIn} className="w-full">
              Sign In Anonymously
            </Button>
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
            <Button onClick={checkAuthState} variant="secondary" className="w-full">
              Check Auth State
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <p className="font-medium mb-2">Current User:</p>
              {user ? (
                <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                  {JSON.stringify(
                    {
                      uid: user.uid,
                      email: user.email,
                      displayName: user.displayName,
                      isAnonymous: user.isAnonymous,
                    },
                    null,
                    2,
                  )}
                </pre>
              ) : (
                <p className="text-muted-foreground">No user signed in</p>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>

      {(result || error) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded mb-4">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
            {result && (
              <pre className="bg-muted p-4 rounded text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
