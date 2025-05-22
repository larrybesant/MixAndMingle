import { Skeleton } from "@/components/ui/skeleton"

export function RoomSkeleton() {
  return (
    <div className="w-full space-y-6 p-4">
      {/* Room header skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Room content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-lg" />

        <div className="flex justify-between">
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Room participants skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Room chat skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-24" />
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-20 w-3/4 rounded-md" />
          </div>
          <div className="flex items-start space-x-2 justify-end">
            <Skeleton className="h-16 w-2/3 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <div className="flex items-start space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-12 w-1/2 rounded-md" />
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}
