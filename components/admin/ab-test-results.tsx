"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { abTestingService, type ABTest } from "@/lib/ab-testing-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ABTestResultsProps {
  test: ABTest
}

export function ABTestResults({ test }: ABTestResultsProps) {
  const [significance, setSignificance] =
    useState<ReturnType<typeof abTestingService.calculateStatisticalSignificance>>()

  useEffect(() => {
    if (test.results) {
      const sig = abTestingService.calculateStatisticalSignificance(test)
      setSignificance(sig)
    }
  }, [test])

  // Prepare data for charts
  const prepareChartData = () => {
    if (!test.results) return []

    return test.variants.map((variant) => {
      const result = test.results?.[variant.id] || { impressions: 0, conversions: 0, conversionRate: 0 }
      return {
        name: variant.name,
        impressions: result.impressions,
        conversions: result.conversions,
        conversionRate: result.conversionRate.toFixed(2),
      }
    })
  }

  const chartData = prepareChartData()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Test Results: {test.name}</span>
          <Badge variant={test.status === "active" ? "default" : "outline"}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="impressions">Impressions</TabsTrigger>
            <TabsTrigger value="conversions">Conversions</TabsTrigger>
            <TabsTrigger value="rates">Conversion Rates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {test.variants.map((variant) => {
                  const result = test.results?.[variant.id] || { impressions: 0, conversions: 0, conversionRate: 0 }
                  const isWinner = significance?.hasSignificantResult && significance.winningVariantId === variant.id

                  return (
                    <Card key={variant.id} className={isWinner ? "border-green-500 border-2" : ""}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between items-center">
                          <span>{variant.name}</span>
                          {isWinner && <Badge variant="success">Winner</Badge>}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-2 text-sm">
                          <dt>Impressions:</dt>
                          <dd className="text-right">{result.impressions}</dd>

                          <dt>Conversions:</dt>
                          <dd className="text-right">{result.conversions}</dd>

                          <dt>Conversion Rate:</dt>
                          <dd className="text-right">{result.conversionRate.toFixed(2)}%</dd>
                        </dl>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {significance && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Statistical Significance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {significance.hasSignificantResult ? (
                      <div className="space-y-2">
                        <p className="text-green-600 font-medium">Significant result detected!</p>
                        <p>
                          The winning variant is{" "}
                          <strong>{test.variants.find((v) => v.id === significance.winningVariantId)?.name}</strong>{" "}
                          with {significance.confidenceLevel?.toFixed(2)}% confidence.
                        </p>
                      </div>
                    ) : (
                      <p className="text-amber-600">
                        No statistically significant result yet. Continue running the test to gather more data.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="impressions">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" fill="#8884d8" name="Impressions" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="conversions">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversions" fill="#82ca9d" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="rates">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conversionRate" fill="#ffc658" name="Conversion Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
