import type React from "react"
import { redirect } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { auth } from "@/lib/firebase-admin"
import { cookies } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check with fallback for development
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")?.value || ""

  try {
    if (process.env.NODE_ENV === "development" && !process.env.FIREBASE_PROJECT_ID) {
      // Skip authentication in development if Firebase admin credentials aren't set
      console.warn("Skipping authentication check in development (Firebase Admin not configured)")
    } else if (sessionCookie) {
      // Verify the session cookie if it exists
      try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie)
        if (!decodedClaims) {
          redirect("/login")
        }
      } catch (error) {
        console.error("Error verifying session cookie:", error)
        redirect("/login")
      }
    } else {
      redirect("/login")
    }
  } catch (error) {
    console.error("Error in auth check:", error)
    // Fallback for development
    if (process.env.NODE_ENV !== "production") {
      console.warn("Continuing without authentication in development mode")
    } else {
      redirect("/login")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">Mix & Mingle</span>
          </div>
          <UserNav />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}
