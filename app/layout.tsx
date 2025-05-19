import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Inter } from "next/font/google"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import Link from "next/link"
import { Info } from "lucide-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MIX & MINGLE | Social Event Planning",
  description: "Stream live DJs and connect with music lovers worldwide",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              {/* Beta announcement banner */}
              <div className="bg-blue-900/30 border-b border-blue-800 py-2 px-4 text-center text-sm">
                <div className="container flex items-center justify-center">
                  <Info className="h-4 w-4 text-blue-400 mr-2" />
                  <span>
                    Welcome to the MIX & MINGLE beta! Please{" "}
                    <Link href="/beta-guide" className="text-blue-400 hover:underline font-medium">
                      read our beta guide
                    </Link>{" "}
                    and{" "}
                    <Link href="/feedback" className="text-blue-400 hover:underline font-medium">
                      share your feedback
                    </Link>
                    .
                  </span>
                </div>
              </div>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
