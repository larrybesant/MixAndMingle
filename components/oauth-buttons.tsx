"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function OAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleOAuthSignIn = async (provider: "google" | "facebook") => {
    try {
      setLoading(provider)

      const authProvider = provider === "google" ? new GoogleAuthProvider() : new FacebookAuthProvider()

      const result = await signInWithPopup(auth, authProvider)
      const user = result.user

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date(),
          profileComplete: false,
        })

        toast({
          title: "Account created!",
          description: "Welcome to Mix-and-Mingle!",
        })

        router.push("/onboarding")
      } else {
        toast({
          title: "Logged in successfully",
          description: "Welcome back to Mix-and-Mingle!",
        })

        router.push("/dashboard")
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <Button
        variant="outline"
        onClick={() => handleOAuthSignIn("google")}
        disabled={loading !== null}
        className="w-full"
      >
        {loading === "google" ? "Connecting..." : "Continue with Google"}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleOAuthSignIn("facebook")}
        disabled={loading !== null}
        className="w-full"
      >
        {loading === "facebook" ? "Connecting..." : "Continue with Facebook"}
      </Button>
    </div>
  )
}
