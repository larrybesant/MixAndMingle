import { Suspense } from "react"
import { DynamicImportExample } from "@/components/dynamic-import-example"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export default function BundleOptimizationPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Bundle Size Optimization</h1>

      <Tabs defaultValue="dynamic">
        <TabsList>
          <TabsTrigger value="dynamic">Dynamic Imports</TabsTrigger>
          <TabsTrigger value="code-splitting">Code Splitting</TabsTrigger>
          <TabsTrigger value="tree-shaking">Tree Shaking</TabsTrigger>
        </TabsList>

        <TabsContent value="dynamic" className="mt-4">
          <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
            <DynamicImportExample />
          </Suspense>
        </TabsContent>

        <TabsContent value="code-splitting" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Splitting</CardTitle>
              <CardDescription>
                Next.js automatically splits your code into smaller chunks for each route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Each page in your application becomes its own JavaScript bundle, which means users only download the
                code they need for the current page.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <pre className="text-sm">
                  {`
// This creates a separate chunk
import dynamic from 'next/dynamic'

// VideoRoom will be loaded only when needed
const VideoRoom = dynamic(() => import('@/components/video-room'), {
  loading: () => <p>Loading video room...</p>
})
                  `}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tree-shaking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tree Shaking</CardTitle>
              <CardDescription>Eliminating dead code from your bundles</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Tree shaking removes unused code from your production bundles. This is especially important for large
                libraries like Firebase.
              </p>
              <div className="mt-4 p-4 bg-muted rounded-md">
                <pre className="text-sm">
                  {`
// BAD: Imports entire firebase/firestore module
import * as firestore from 'firebase/firestore'

// GOOD: Only imports what you need
import { collection, getDocs } from 'firebase/firestore'
                  `}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
