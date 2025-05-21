import BetaPageClient from "./BetaPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Beta Program | Mix & Mingle",
  description: "Your beta testing dashboard for Mix & Mingle",
}

export default function BetaPage() {
  return <BetaPageClient />
}
