import { ProfileView } from "@/components/profile/profile-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { auth } from "@/lib/firebase-admin"
import { redirect } from "next/navigation"

export default async function MyProfilePage() {
  // This is a server component, so we can use the Firebase Admin SDK
  try {
    const session = await auth.currentUser

    if (!session) {
      redirect("/login")
    }

    return (
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileView userId={session.uid} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error getting current user:", error)
    redirect("/login")
  }
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
