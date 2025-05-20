import { Suspense } from "react"
import { getRoadmapItems } from "@/lib/roadmap-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { RoadmapViewSwitcher } from "@/components/roadmap-view-switcher"

export const metadata = {
  title: "Roadmap List | Mix & Mingle",
  description: "View the Mix & Mingle roadmap items in a list format",
}

async function ListContent() {
  const roadmapItems = await getRoadmapItems()

  return (
    <div className="space-y-8">
      {/* List view implementation */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mix & Mingle Roadmap</h2>
        <RoadmapViewSwitcher />
      </div>

      {/* Implement list view here */}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}

export default function RoadmapListPage() {
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
        <h1 className="text-3xl font-bold mb-2">Mix & Mingle Roadmap List</h1>
        <p className="text-gray-600">View all roadmap items in a sortable list format.</p>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <ListContent />
      </Suspense>
    </div>
  )
}
