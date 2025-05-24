import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import AuthDebug from "@/components/auth/auth-debug"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "DJ Mix & Mingle - Connect with DJs Worldwide",
  description: "The ultimate social platform for DJs to connect, chat, and collaborate",
  generator: "v0.dev",
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading DJ Mix & Mingle...</p>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<LoadingFallback />}>
          <AuthProvider>
            {children}
            <AuthDebug />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  )
}
