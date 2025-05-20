import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth-context"
import { WebRTCProvider } from "@/lib/webrtc-context"
import { NotificationProvider } from "@/lib/notification-context"
import { AnalyticsProvider } from "@/providers/analytics-provider"
import { OnboardingFlow } from "@/components/onboarding-flow"
import { PageViewTracker } from "@/components/page-view-tracker"
import { AnalyticsConsent } from "@/components/analytics-consent"
import { cn } from "@/lib/utils"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mix & Mingle",
  description: "Connect, chat, and share with friends on Mix & Mingle",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AnalyticsProvider>
              <NotificationProvider>
                <WebRTCProvider>
                  <Suspense fallback={null}>
                    {children}
                    <OnboardingFlow />
                    <Toaster />
                    <PageViewTracker />
                    <AnalyticsConsent />
                  </Suspense>
                </WebRTCProvider>
              </NotificationProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
