import { BadgeLeaderboardFull } from "@/components/badge-leaderboard-full"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function BadgeLeaderboardPage() {
  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Badge Leaderboard</h1>
          <p className="text-muted-foreground">
            Explore the top badge collectors and see who's leading in different categories
          </p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/dashboard/beta" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Beta Dashboard
          </Link>
        </Button>
      </div>

      <BadgeLeaderboardFull />
    </div>
  )
}
