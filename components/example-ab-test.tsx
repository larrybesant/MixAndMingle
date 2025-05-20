"use client"

import { useState, useEffect } from "react"
import { useABTesting } from "@/lib/ab-testing-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// This is an example A/B test component that demonstrates how to use the A/B testing framework
export function ExampleABTest() {
  const { activeTests, getUserVariant } = useABTesting()
  const [currentVariant, setCurrentVariant] = useState<string | null>(null)
  const [testId] = useState("button-color-test") // This would be a real test ID in production

  useEffect(() => {
    const loadVariant = async () => {
      // In a real implementation, you would get the variant from the A/B testing service
      // For this example, we'll just randomly choose a variant
      const variants = ["control", "variant-a", "variant-b"]
      const randomVariant = variants[Math.floor(Math.random() * variants.length)]
      setCurrentVariant(randomVariant)
    }

    loadVariant()
  }, [])

  // In a real implementation, you would use the useABTestEvent hook
  const handleClick = () => {
    console.log(`Button clicked for variant: ${currentVariant}`)
    // In a real implementation:
    // logConversion();
  }

  if (!currentVariant) {
    return <div>Loading...</div>
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Example A/B Test
          <Badge variant="outline">
            Variant:{" "}
            {currentVariant === "control" ? "Control" : currentVariant === "variant-a" ? "Variant A" : "Variant B"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          This is an example of how A/B testing works in Mix & Mingle. Different variants of a component are shown to
          different users to determine which variant performs better.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={handleClick}>Click Me</Button>
      </CardFooter>
    </Card>
  )
}
