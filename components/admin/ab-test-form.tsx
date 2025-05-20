"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Save } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { abTestingService, type ABTest, type ABTestVariant } from "@/lib/ab-testing-service"

interface ABTestFormProps {
  initialTest?: Partial<ABTest>
  onSave: (test: ABTest) => void
  onCancel: () => void
}

export function ABTestForm({ initialTest, onSave, onCancel }: ABTestFormProps) {
  const [name, setName] = useState(initialTest?.name || "")
  const [description, setDescription] = useState(initialTest?.description || "")
  const [status, setStatus] = useState<ABTest["status"]>(initialTest?.status || "draft")
  const [primaryMetric, setPrimaryMetric] = useState(initialTest?.metrics?.primary || "click-through-rate")
  const [allUsers, setAllUsers] = useState(initialTest?.targetAudience?.allUsers !== false)
  const [variants, setVariants] = useState<ABTestVariant[]>(
    initialTest?.variants || [
      { id: uuidv4(), name: "Control", description: "Original version", weight: 50 },
      { id: uuidv4(), name: "Variant A", description: "Test version", weight: 50 },
    ],
  )

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: uuidv4(),
        name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
        description: "",
        weight: 100 / (variants.length + 1),
      },
    ])

    // Rebalance weights
    const newWeight = 100 / (variants.length + 1)
    setVariants((prev) => prev.map((v) => ({ ...v, weight: newWeight })))
  }

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 2) {
      alert("You must have at least two variants")
      return
    }

    setVariants(variants.filter((v) => v.id !== id))

    // Rebalance weights
    const newWeight = 100 / (variants.length - 1)
    setVariants((prev) => prev.filter((v) => v.id !== id).map((v) => ({ ...v, weight: newWeight })))
  }

  const handleVariantChange = (id: string, field: keyof ABTestVariant, value: any) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const testData: Omit<ABTest, "id" | "createdAt" | "updatedAt"> = {
        name,
        description,
        status,
        variants,
        targetAudience: {
          allUsers,
        },
        metrics: {
          primary: primaryMetric,
        },
      }

      let savedTest: ABTest

      if (initialTest?.id) {
        await abTestingService.updateTest(initialTest.id, testData)
        savedTest = {
          ...testData,
          id: initialTest.id,
          createdAt: initialTest.createdAt || new Date(),
          updatedAt: new Date(),
        } as ABTest
      } else {
        savedTest = await abTestingService.createTest(testData)
      }

      onSave(savedTest)
    } catch (error) {
      console.error("Error saving test:", error)
      alert("Failed to save test. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{initialTest?.id ? "Edit A/B Test" : "Create A/B Test"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Test Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Button Color Test"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this test"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as ABTest["status"])}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-metric">Primary Metric</Label>
            <Select value={primaryMetric} onValueChange={setPrimaryMetric}>
              <SelectTrigger id="primary-metric">
                <SelectValue placeholder="Select primary metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="click-through-rate">Click-through Rate</SelectItem>
                <SelectItem value="conversion-rate">Conversion Rate</SelectItem>
                <SelectItem value="time-on-page">Time on Page</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="all-users" checked={allUsers} onCheckedChange={setAllUsers} />
            <Label htmlFor="all-users">Target all users</Label>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Variants</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                <Plus className="h-4 w-4 mr-1" /> Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <Card key={variant.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-4 flex-1">
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Label htmlFor={`variant-${index}-name`}>Name</Label>
                        <Input
                          id={`variant-${index}-name`}
                          value={variant.name}
                          onChange={(e) => handleVariantChange(variant.id, "name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`variant-${index}-weight`}>Weight (%)</Label>
                        <Input
                          id={`variant-${index}-weight`}
                          type="number"
                          min="1"
                          max="99"
                          value={variant.weight}
                          onChange={(e) => handleVariantChange(variant.id, "weight", Number(e.target.value))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`variant-${index}-description`}>Description</Label>
                      <Input
                        id={`variant-${index}-description`}
                        value={variant.description || ""}
                        onChange={(e) => handleVariantChange(variant.id, "description", e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveVariant(variant.id)}
                    disabled={variants.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-1" />
            Save Test
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
