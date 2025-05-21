import { ProfileView } from "@/components/profile/profile-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface ProfilePageProps {
  params: {
    userId: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="container max-w-4xl py-10">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileView userId={params.userId} />
      </Suspense>
    </div>
  )
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
