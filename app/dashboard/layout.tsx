"use client"

import type React from "react"

import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
import { AuthProvider } from "@/components/auth-provider"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </AuthProvider>
  )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth()

  // If we're still loading, show a loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If there's an error with authentication, show an error message
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-4">
          There was an error with the authentication service. This could be due to missing or invalid API keys.
        </p>
        <p className="text-sm text-gray-500 mb-6">Error details: {error.message}</p>
        <div className="flex gap-4">
          <a href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Return Home
          </a>
          {process.env.NODE_ENV === "development" && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  // For development, allow access without authentication
  const isDevelopment = process.env.NODE_ENV === "development"

  // In production, redirect to login if not authenticated
  if (!user && !isDevelopment) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
