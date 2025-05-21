"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { abTestingService } from "@/lib/ab-testing-service"
import { useToast } from "@/hooks/use-toast"

export function OnboardingABTestSetup() {
  const [isLoading, setIsLoading] = useState(false)
  const [testExists, setTestExists] = useState(false)
  const [testId, setTestId] = useState("")
  const [weights, setWeights] = useState({
    standard: 33,
    minimal: 33,
    gamified: 34,
  })
  const { toast } = useToast()

  useEffect(() => {
    const checkExistingTest = async () => {
      try {
        setIsLoading(true)
        const tests = await abTestingService.getAllTests()
        const onboardingTest = tests.find((test) => test.id === "onboarding-experience")

        if (onboardingTest) {
          setTestExists(true)
          setTestId(onboardingTest.id)

          // Set weights from existing test
          const standardVariant = onboardingTest.variants.find((v) => v.id === "standard")
          const minimalVariant = onboardingTest.variants.find((v) => v.id === "minimal")
          const gamifiedVariant = onboardingTest.variants.find((v) => v.id === "gamified")

          setWeights({
            standard: standardVariant?.weight || 33,
            minimal: minimalVariant?.weight || 33,
            gamified: gamifiedVariant?.weight || 34,
          })
        }
      } catch (error) {
        console.error("Error checking existing test:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingTest()
  }, [])

  const handleWeightChange = (variant: keyof typeof weights, value: number[]) => {
    const newValue = value[0]
    const otherVariants = Object.keys(weights).filter((key) => key !== variant) as Array<keyof typeof weights>

    // Calculate how much we need to adjust other variants
    const currentTotal = Object.values(weights).reduce((sum, w) => sum + w, 0)
    const diff = newValue - weights[variant]

    // Distribute the difference proportionally among other variants
    const newWeights = { ...weights, [variant]: newValue }

    if (diff !== 0) {
      const totalOtherWeights = otherVariants.reduce((sum, key) => sum + weights[key], 0)

      otherVariants.forEach((key) => {
        const proportion = totalOtherWeights > 0 ? weights[key] / totalOtherWeights : 1 / otherVariants.length
        newWeights[key] = Math.max(0, weights[key] - diff * proportion)
      })

      // Ensure total is 100
      const newTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
      if (newTotal !== 100) {
        const adjustment = (100 - newTotal) / otherVariants.length
        otherVariants.forEach((key) => {
          newWeights[key] += adjustment
        })
      }

      // Round values
      Object.keys(newWeights).forEach((key) => {
        newWeights[key as keyof typeof weights] = Math.round(newWeights[key as keyof typeof weights])
      })

      // Final adjustment to ensure exactly 100
      const finalTotal = Object.values(newWeights).reduce((sum, w) => sum + w, 0)
      if (finalTotal !== 100) {
        const lastKey = Object.keys(newWeights)[Object.keys(newWeights).length - 1] as keyof typeof weights
        newWeights[lastKey] += 100 - finalTotal
      }
    }

    setWeights(newWeights)
  }

  const createOrUpdateTest = async () => {
    try {
      setIsLoading(true)

      const testData = {
        id: "onboarding-experience",
        name: "Onboarding Experience",
        description: "Testing different onboarding flows to improve user activation",
        status: "active" as const,
        variants: [
          { id: "standard", name: "Standard", weight: weights.standard },
          { id: "minimal", name: "Minimal", weight: weights.minimal },
          { id: "gamified", name: "Gamified", weight: weights.gamified },
        ],
        metrics: {
          primary: "conversion",
          secondary: ["task_completed", "next_step", "previous_step", "skip"],
        },
        startDate: new Date().toISOString(),
      }

      if (testExists) {
        await abTestingService.updateTest("onboarding-experience", testData)
        toast({
          title: "Test Updated",
          description: "The onboarding A/B test has been updated successfully.",
        })
      } else {
        await abTestingService.createTest(testData)
        setTestExists(true)
        setTestId("onboarding-experience")
        toast({
          title: "Test Created",
          description: "The onboarding A/B test has been created successfully.",
        })
      }
    } catch (error) {
      console.error("Error creating/updating test:", error)
      toast({
        title: "Error",
        description: "Failed to create/update the test. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding A/B Test</CardTitle>
        <CardDescription>Configure the A/B test for different onboarding experiences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="variants">
          <TabsList className="mb-4">
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="variants">
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Standard Onboarding</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weights.standard]}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                      onValueChange={(value) => handleWeightChange("standard", value)}
                    />
                    <div className="w-12 text-right">{weights.standard}%</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Multi-step onboarding with detailed explanations</p>
                </div>

                <div>
                  <Label>Minimal Onboarding</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weights.minimal]}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                      onValueChange={(value) => handleWeightChange("minimal", value)}
                    />
                    <div className="w-12 text-right">{weights.minimal}%</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Single-page simplified onboarding with key features
                  </p>
                </div>

                <div>
                  <Label>Gamified Onboarding</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[weights.gamified]}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                      onValueChange={(value) => handleWeightChange("gamified", value)}
                    />
                    <div className="w-12 text-right">{weights.gamified}%</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Task-based onboarding with points and rewards</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Standard</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <img
                    src="/onboarding-flow.png"
                    alt="Standard Onboarding"
                    className="w-full h-auto rounded-md"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Minimal</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <img
                    src="/placeholder.svg?height=200&width=200&query=minimal onboarding with single page"
                    alt="Minimal Onboarding"
                    className="w-full h-auto rounded-md"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">Gamified</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <img
                    src="/placeholder.svg?height=200&width=200&query=gamified onboarding with points and rewards"
                    alt="Gamified Onboarding"
                    className="w-full h-auto rounded-md"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={createOrUpdateTest} disabled={isLoading}>
          {testExists ? "Update Test" : "Create Test"}
        </Button>
      </CardFooter>
    </Card>
  )
}
