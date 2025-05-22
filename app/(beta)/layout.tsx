import type React from "react"
import BetaAccessGuard from "@/components/beta-access-guard"

export default function BetaLayout({ children }: { children: React.ReactNode }) {
  return <BetaAccessGuard>{children}</BetaAccessGuard>
}
