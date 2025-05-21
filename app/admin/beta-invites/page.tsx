import type { Metadata } from "next"
import { BetaInviteLinkGenerator } from "@/components/admin/beta-invite-link-generator"
import { BetaInviteGenerator } from "@/components/admin/beta-invite-generator"

export const metadata: Metadata = {
  title: "Beta Invites | Admin Dashboard",
  description: "Generate and manage beta invitation codes and links.",
}

export default function BetaInvitesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Beta Invitations</h1>

      <div className="grid gap-8">
        <BetaInviteLinkGenerator />
        <BetaInviteGenerator />
      </div>
    </div>
  )
}
