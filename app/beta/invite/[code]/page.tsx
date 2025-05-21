import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase-admin-safe"
import { BetaInviteDetails } from "@/components/beta/beta-invite-details"

interface BetaInvitePageProps {
  params: {
    code: string
  }
}

export const metadata: Metadata = {
  title: "Beta Invitation | Mix & Mingle",
  description: "Join the Mix & Mingle beta testing program with your exclusive invitation.",
}

async function getInviteDetails(code: string) {
  try {
    const inviteRef = doc(db, "betaInviteCodes", code)
    const inviteSnap = await getDoc(inviteRef)

    if (!inviteSnap.exists()) {
      return null
    }

    const inviteData = inviteSnap.data()

    // Check if expired
    const expiryDate = inviteData.expiresAt?.toDate()
    if (expiryDate && expiryDate < new Date()) {
      return { ...inviteData, isExpired: true }
    }

    return { ...inviteData, isExpired: false }
  } catch (error) {
    console.error("Error fetching invite details:", error)
    return null
  }
}

export default async function BetaInviteCodePage({ params }: BetaInvitePageProps) {
  const { code } = params
  const inviteDetails = await getInviteDetails(code)

  if (!inviteDetails) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BetaInviteDetails code={code} details={inviteDetails} />
    </div>
  )
}
