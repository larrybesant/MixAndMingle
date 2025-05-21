import Link from "next/link"
import { SignupForm } from "@/components/signup-form"
import { FirebaseConnectionTest } from "@/components/firebase-connection-test"

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">Enter your information to get started with Mix & Mingle</p>
          </div>
          <SignupForm />
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>

          {/* Only show in development */}
          {process.env.NODE_ENV !== "production" && (
            <div className="mt-8">
              <FirebaseConnectionTest />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
