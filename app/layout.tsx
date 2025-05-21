import type React from "react"
import { ABTestingProvider } from "@/lib/ab-testing-context"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ABTestingProvider>{children}</ABTestingProvider>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
