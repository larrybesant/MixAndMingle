import { Suspense } from "react"
import { RoadmapManager } from "@/components/admin/roadmap-manager"
import { getRoadmapItems } from "@/lib/roadmap-service"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Roadmap Management | Mix & Mingle Admin",
  description: "Manage the public roadmap for Mix & Mingle",
}

async function RoadmapManagerContent() {
  const roadmapItems = await getRoadmapItems()

  // In a real implementation, you would fetch feedback items here
  const feedbackItems = [] // Placeholder

  return (
    <RoadmapManager
      roadmapItems={roadmapItems}
      feedbackItems={feedbackItems}
      onCreateItem={async () => {}} // These would be implemented in a client component
      onUpdateItem={async () => {}}
      onDeleteItem={async () => {}}
      onLinkFeedback={async () => {}}
    />
  )
}

function RoadmapManagerSkeleton() {
  return <Skeleton className="h-[600px] w-full" />
}

export default function RoadmapManagementPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Roadmap Management</h1>
        <p className="text-gray-600">
          Manage the public roadmap for Mix & Mingle. Create, edit, and link feedback to roadmap items.
        </p>
      </div>

      <Suspense fallback={<RoadmapManagerSkeleton />}>
        <RoadmapManagerContent />
      </Suspense>
    </div>
  )
}
