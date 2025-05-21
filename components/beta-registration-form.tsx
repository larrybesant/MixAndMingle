"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth, db } from "@/lib/firebase-client-safe"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function BetaRegistrationForm() {
  const router = useRouter()
  const [inviteCode, setInviteCode] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [codeVerified, setCodeVerified] = useState(false)
  const [inviteData, setInviteData] = useState<any>(null)

  const verifyInviteCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter your invitation code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const q = query(
        collection(db, "betaInviteCodes"),
        where("code", "==", inviteCode.trim()),
        where("used", "==", false),
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError("Invalid or already used invitation code")
        return
      }

      const inviteDoc = querySnapshot.docs[0]
      const inviteData = inviteDoc.data()

      // Check if code is expired
      const expiryDate = inviteData.expiresAt?.toDate()
      if (expiryDate && expiryDate < new Date()) {
        setError("This invitation code has expired")
        return
      }

      setInviteData({
        id: inviteDoc.id,
        ...inviteData,
      })

      setCodeVerified(true)
      setStep(2)
    } catch (error) {
      console.error("Error verifying invite code:", error)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!password) {
      setError("Please enter a password")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile
      await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: name,
          isBetaTester: true,
          betaStatus: "active",
          betaAccessLevel: inviteData.accessLevel || "standard",
          createdAt: new Date().toISOString(),
        }),
      })

      // Mark invite code as used
      await updateDoc(doc(db, "betaInviteCodes", inviteData.id), {
        used: true,
        usedBy: user.uid,
        usedAt: serverTimestamp(),
      })

      toast({
        title: "Registration Successful",
        description: "Welcome to the Mix & Mingle beta program!",
      })

      // Redirect to onboarding
      router.push("/beta/onboarding")
    } catch (error: any) {
      console.error("Error during registration:", error)

      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use a different email or login.")
      } else {
        setError("An error occurred during registration. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beta Registration</CardTitle>
        <CardDescription>
          {step === 1 ? "Enter your invitation code to join the beta program" : "Create your account to get started"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Beta Invitation Code</Label>
              <Input
                id="inviteCode"
                placeholder="Enter your invitation code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegistration} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Complete Registration"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>

      {step === 1 && (
        <CardFooter>
          <Button onClick={verifyInviteCode} className="w-full" disabled={loading || !inviteCode.trim()}>
            {loading ? "Verifying..." : "Verify Invitation Code"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
