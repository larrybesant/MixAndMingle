import { LandingHero } from "@/components/landing-hero"
import { LandingFeatures } from "@/components/landing-features"
import { UpcomingStreams } from "@/components/upcoming-streams"
import { LandingFooter } from "@/components/landing-footer"
import { LandingHeader } from "@/components/landing-header"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <UpcomingStreams />
      </main>
      <LandingFooter />
    </div>
  )
}
