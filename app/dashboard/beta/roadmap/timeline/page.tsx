import { Suspense } from "react"
import { RoadmapTimeline } from "@/components/roadmap-timeline"
import { getRoadmapItems } from "@/lib/roadmap-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Roadmap Timeline | Mix & Mingle",
  description: "View the Mix & Mingle development timeline and upcoming features",
}

async function TimelineContent() {
  const roadmapItems = await getRoadmapItems()

  return (
    <div className="space-y-8">
      <RoadmapTimeline roadmapItems={roadmapItems} />
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[800px] w-full" />
    </div>
  )
}

export default function RoadmapTimelinePage() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/dashboard/beta/roadmap">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roadmap Board
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mix & Mingle Development Timeline</h1>
        <p className="text-gray-600">See our development schedule and when new features are planned to be released.</p>
      </div>

      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineContent />
      </Suspense>
    </div>
  )
}
