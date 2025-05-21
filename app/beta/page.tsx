import { Suspense } from "react"
import { LazyBetaFeatures, LazyBetaTestimonials, LazyBetaFAQ } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"

export default function BetaPage() {
  return (
    <div className="container py-12 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Mix & Mingle Beta Program</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join our exclusive beta program and help shape the future of social networking.
        </p>
      </section>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid gap-6 md:grid-cols-3">
              <Skeleton className="h-[200px] rounded-lg" />
              <Skeleton className="h-[200px] rounded-lg" />
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
          </div>
        }
      >
        <LazyBetaFeatures />
      </Suspense>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-[150px] rounded-lg" />
              <Skeleton className="h-[150px] rounded-lg" />
            </div>
          </div>
        }
      >
        <LazyBetaTestimonials />
      </Suspense>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        }
      >
        <LazyBetaFAQ />
      </Suspense>
    </div>
  )
}
