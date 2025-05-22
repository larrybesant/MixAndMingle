import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Import the GlobalPresenceProvider
import GlobalPresenceProvider from "@/components/global-presence-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

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
  // Wrap the children with the GlobalPresenceProvider
  // Find the existing layout return statement and modify it to include GlobalPresenceProvider
  // It should look something like this:
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <GlobalPresenceProvider>{children}</GlobalPresenceProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
