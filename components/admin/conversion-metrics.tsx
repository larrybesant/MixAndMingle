"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data - in a real app, this would come from Firebase Analytics
const mockConversionRates = [
  { step: "Visit", rate: 100 },
  { step: "Sign Up", rate: 35 },
  { step: "Create Profile", rate: 28 },
  { step: "Join Room", rate: 22 },
  { step: "Send Message", rate: 18 },
  { step: "Return Visit", rate: 15 },
  { step: "Subscribe", rate: 8 },
]

const mockSubscriptionTrends = [
  { month: "Jan", free: 1200, premium: 150, vip: 50 },
  { month: "Feb", free: 1300, premium: 180, vip: 60 },
  { month: "Mar", free: 1400, premium: 210, vip: 70 },
  { month: "Apr", free: 1500, premium: 250, vip: 85 },
  { month: "May", free: 1600, premium: 300, vip: 100 },
]

const mockRevenueBySource = [
  { source: "Premium Subscriptions", revenue: 15000 },
  { source: "VIP Subscriptions", revenue: 10000 },
  { source: "Virtual Gifts", revenue: 8000 },
  { source: "Profile Boosts", revenue: 3000 },
  { source: "Other", revenue: 1000 },
]

interface ConversionMetricsProps {
  dateRange: { from: Date; to: Date }
}

export function ConversionMetrics({ dateRange }: ConversionMetricsProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [dateRange])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
            <CardDescription>Visitors to paid users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8%</div>
            <p className="text-sm text-muted-foreground">+1.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Total revenue this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$37,000</div>
            <p className="text-sm text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ARPU</CardTitle>
            <CardDescription>Average revenue per user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12.50</div>
            <p className="text-sm text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="funnel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Trends</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey conversion rates</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  rate: {
                    label: "Conversion Rate (%)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockConversionRates}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="step" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="rate" fill="var(--color-rate)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Trends</CardTitle>
              <CardDescription>User subscription types over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  free: {
                    label: "Free Users",
                    color: "hsl(var(--chart-1))",
                  },
                  premium: {
                    label: "Premium Users",
                    color: "hsl(var(--chart-2))",
                  },
                  vip: {
                    label: "VIP Users",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockSubscriptionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="free" stroke="var(--color-free)" strokeWidth={2} />
                    <Line type="monotone" dataKey="premium" stroke="var(--color-premium)" strokeWidth={2} />
                    <Line type="monotone" dataKey="vip" stroke="var(--color-vip)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Sources</CardTitle>
              <CardDescription>Revenue breakdown by source</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue ($)",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockRevenueBySource}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
