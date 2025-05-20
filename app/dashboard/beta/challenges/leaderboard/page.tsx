import { ChallengeLeaderboard } from "@/components/challenge-leaderboard"
import { Button } from "@/components/ui/button"
import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"

export default function ChallengeLeaderboardPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/beta/challenges">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Challenge Leaderboard</h1>
      </div>

      <p className="text-muted-foreground mb-8">See who's leading the pack in completing daily challenges</p>

      <ChallengeLeaderboard limit={20} />
    </div>
  )
}
