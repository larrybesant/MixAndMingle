import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientOnly from "@/components/client-only-provider"
import { AuthProvider } from "@/contexts/auth-context"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ClientOnly
          fallback={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
              <div className="text-xl">Loading...</div>
            </div>
          }
        >
          <AuthProvider>{children}</AuthProvider>
        </ClientOnly>
      </body>
    </html>
  )
}
