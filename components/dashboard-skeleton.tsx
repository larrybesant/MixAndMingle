import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border shadow-sm">
            <div className="p-6">
              <Skeleton className="h-6 w-[150px] mb-4" />
              <div className="space-y-4">
                {Array(3)
                  .fill(0)
                  .map((_, j) => (
                    <div key={j} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
