import { ChallengeManager } from "@/components/admin/challenge-manager"

export default function AdminChallengesPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Challenge Management</h1>
      <p className="text-muted-foreground mb-8">Create and manage daily challenges for beta testers</p>

      <ChallengeManager />
    </div>
  )
}
