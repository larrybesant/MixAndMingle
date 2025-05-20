"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { RoadmapItem } from "@/lib/roadmap-service"
import { formatDistanceToNow } from "date-fns"

interface RecentRoadmapUpdatesProps {
  updates: RoadmapItem[]
}

export function RecentRoadmapUpdates({ updates }: RecentRoadmapUpdatesProps) {
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      planned: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      "on-hold": "bg-gray-100 text-gray-800",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Recent Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((item) => (
            <div key={item.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{item.title}</h3>
                <Badge className={getStatusBadge(item.status)}>{item.status.replace("-", " ")}</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Updated {formatDistanceToNow(item.updatedAt.toDate(), { addSuffix: true })}
                </div>
                <Link href={`/dashboard/beta/roadmap/${item.id}`}>
                  <Button variant="ghost" size="sm">
                    Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {updates.length === 0 && <div className="text-center py-4 text-gray-500">No recent updates</div>}
        </div>
      </CardContent>
    </Card>
  )
}
