import { Suspense } from "react"
import { RoadmapItemDetail } from "@/components/roadmap-item-detail"
import { getRoadmapItemById } from "@/lib/roadmap-service"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Roadmap Item | Mix & Mingle",
  description: "View details about an upcoming feature or enhancement",
}

interface RoadmapItemPageProps {
  params: {
    id: string
  }
}

async function RoadmapItemContent({ id }: { id: string }) {
  const item = await getRoadmapItemById(id)

  if (!item) {
    notFound()
  }

  // In a real implementation, you would fetch related feedback here
  const relatedFeedback = [] // Placeholder

  return (
    <RoadmapItemDetail
      item={item}
      relatedFeedback={relatedFeedback}
      onVote={() => {}} // This would be implemented in a client component
      hasVoted={false} // This would be implemented in a client component
    />
  )
}

function RoadmapItemSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

export default function RoadmapItemPage({ params }: RoadmapItemPageProps) {
  return (
    <div className="container py-8">
      <Suspense fallback={<RoadmapItemSkeleton />}>
        <RoadmapItemContent id={params.id} />
      </Suspense>
    </div>
  )
}
