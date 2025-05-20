"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExampleABTest } from "@/components/example-ab-test"
import Car from "@/components/car" // Declare the Car variable

export default function BetaABTestingPage() {
  const [activeTab, setActiveTab] = useState("about")

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">A/B Testing Program</h1>
        <p className="text-muted-foreground">
          Help us improve Mix & Mingle by participating in our A/B testing program
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="about">About A/B Testing</TabsTrigger>
          <TabsTrigger value="current">Current Tests</TabsTrigger>
          <TabsTrigger value="example">Example Test</TabsTrigger>
        </TabsList>

        <TabsContent value="about">
          <Car />
        </TabsContent>

        <TabsContent value="current">{/* Current Tests content here */}</TabsContent>

        <TabsContent value="example">
          <ExampleABTest />
        </TabsContent>
      </Tabs>
    </div>
  )
}
