"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { signUp } = useAuth()
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setDebugInfo(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      console.log("Starting signup process for:", email)

      // Create user using the auth context
      const result = await signUp(email, password, name)
      console.log("User created successfully:", result.user.uid)

      toast({
        title: "Account created!",
        description: "You've successfully signed up for Mix & Mingle.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Signup error:", error)
      setDebugInfo(`Error type: ${error.name}, Code: ${error.code}, Message: ${error.message}`)

      // More user-friendly error messages
      if (error.code === "auth/invalid-api-key") {
        setError("Firebase configuration error. Please make sure Firebase is properly set up.")
      } else if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Try logging in instead.")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.")
      } else if (error.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.")
      } else {
        setError(error.message || "Something went wrong. Please try again.")
      }

      toast({
        variant: "destructive",
        title: "Error creating account",
        description: "Please check the form for errors.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {debugInfo && process.env.NODE_ENV !== "production" && (
        <Alert variant="default" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
          <Info className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription className="font-mono text-xs break-all">{debugInfo}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" name="name" placeholder="Enter your name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="Enter your email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" placeholder="Create a password" required />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>
  )
}
