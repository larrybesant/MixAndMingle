import { Suspense } from "react"
import { LazySubscriptionPlans, LazySubscriptionManagement } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"

export default function SubscriptionPage() {
  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-[300px] rounded-lg" />
              <Skeleton className="h-[300px] rounded-lg" />
              <Skeleton className="h-[300px] rounded-lg" />
            </div>
          }
        >
          <LazySubscriptionPlans />
        </Suspense>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Manage Your Subscription</h2>
        <Suspense
          fallback={
            <div className="space-y-6">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          }
        >
          <LazySubscriptionManagement />
        </Suspense>
      </section>
    </div>
  )
}
