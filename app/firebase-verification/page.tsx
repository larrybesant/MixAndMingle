"use client"

import { FirebaseTestResults } from "@/components/firebase-test-results"
import { CircularDependencyChecker } from "@/components/circular-dependency-checker"
import { FirebaseVersionChecker } from "@/components/firebase-version-checker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function FirebaseVerificationPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Firebase Verification</h1>
        <p className="text-muted-foreground mt-2">
          Verify that all Firebase imports and functionality are working correctly
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Check if required Firebase environment variables are set</CardDescription>
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
                <span className="font-medium">NEXT_PUBLIC_FIREBASE_PROJECT_ID:</span>{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:</span>{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:</span>{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">NEXT_PUBLIC_FIREBASE_APP_ID:</span>{" "}
                {process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">FIREBASE_PROJECT_ID:</span>{" "}
                {process.env.FIREBASE_PROJECT_ID ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">FIREBASE_CLIENT_EMAIL:</span>{" "}
                {process.env.FIREBASE_CLIENT_EMAIL ? "✅ Set" : "❌ Missing"}
              </li>
              <li>
                <span className="font-medium">FIREBASE_PRIVATE_KEY:</span>{" "}
                {process.env.FIREBASE_PRIVATE_KEY ? "✅ Set" : "❌ Missing"}
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Firebase Safe Imports</CardTitle>
            <CardDescription>Check if Firebase safe imports are properly configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Your application should use the safe Firebase imports from:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">@/lib/firebase-client-safe</code> for client-side
              </li>
              <li>
                <code className="bg-muted px-1 py-0.5 rounded">@/lib/firebase-admin-safe</code> for server-side
              </li>
            </ul>
            <p>These files provide centralized Firebase initialization and prevent multiple initializations.</p>
            <div className="flex justify-end">
              <Button variant="outline" asChild>
                <Link href="/firebase-import-test">Check Import Status</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <FirebaseVersionChecker />

      <FirebaseTestResults />

      <CircularDependencyChecker />

      <div className="flex justify-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/auth-test">Test Authentication</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/firebase-import-test">Test Imports</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
