import type React from "react"
import { Suspense } from "react"
import { LazyDashboardNav, LazyNotificationBell } from "@/components/lazy"
import { Skeleton } from "@/components/ui/skeleton"
import { UserNav } from "@/components/user-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Mix & Mingle</h1>
          </div>
          <div className="flex items-center gap-4">
            <Suspense fallback={<Skeleton className="h-10 w-10 rounded-full" />}>
              <LazyNotificationBell />
            </Suspense>
            <UserNav />
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <div className="sticky top-16 p-4 h-[calc(100vh-4rem)] overflow-auto">
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              }
            >
              <LazyDashboardNav />
            </Suspense>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
