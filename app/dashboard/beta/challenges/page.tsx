import { DailyChallenges } from "@/components/daily-challenges"
import { ChallengeLeaderboard } from "@/components/challenge-leaderboard"

export default function ChallengesPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Daily Challenges</h1>
      <p className="text-muted-foreground mb-8">
        Complete daily challenges to earn points, badges, and climb the leaderboard
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DailyChallenges />
        </div>
        <div>
          <ChallengeLeaderboard limit={5} />
        </div>
      </div>
    </div>
  )
}
