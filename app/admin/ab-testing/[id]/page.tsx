"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download } from "lucide-react"
import { ABTestResults } from "@/components/admin/ab-test-results"
import { abTestingService, type ABTest, type ABTestEvent } from "@/lib/ab-testing-service"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function ABTestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [test, setTest] = useState<ABTest | null>(null)
  const [events, setEvents] = useState<ABTestEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTest = async () => {
      if (!params.id) return

      try {
        const testId = params.id as string
        const testData = await abTestingService.getTest(testId)

        if (!testData) {
          router.push("/admin/ab-testing")
          return
        }

        setTest(testData)

        // Load events
        const testEvents = await abTestingService.getTestEvents(testId)
        setEvents(testEvents)
      } catch (error) {
        console.error("Error loading test:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTest()
  }, [params.id, router])

  const handleExportData = () => {
    if (!test) return

    // Prepare data for export
    const exportData = {
      test,
      events,
    }

    // Create a download link
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `ab-test-${test.id}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  // Prepare data for time series chart
  const prepareTimeSeriesData = () => {
    if (!events.length) return []

    // Group events by day and variant
    const eventsByDay: Record<string, Record<string, { impressions: number; conversions: number }>> = {}

    events.forEach((event) => {
      const day = new Date(event.timestamp).toISOString().split("T")[0]

      if (!eventsByDay[day]) {
        eventsByDay[day] = {}
      }

      if (!eventsByDay[day][event.variantId]) {
        eventsByDay[day][event.variantId] = { impressions: 0, conversions: 0 }
      }

      if (event.eventName === "impression") {
        eventsByDay[day][event.variantId].impressions++
      } else if (event.eventName === "conversion") {
        eventsByDay[day][event.variantId].conversions++
      }
    })

    // Convert to array for chart
    return Object.entries(eventsByDay)
      .map(([day, variants]) => {
        const result: any = { day }

        Object.entries(variants).forEach(([variantId, counts]) => {
          const variant = test?.variants.find((v) => v.id === variantId)
          if (variant) {
            result[`${variant.name} Impressions`] = counts.impressions
            result[`${variant.name} Conversions`] = counts.conversions
            result[`${variant.name} Rate`] =
              counts.impressions > 0 ? (counts.conversions / counts.impressions) * 100 : 0
          }
        })

        return result
      })
      .sort((a, b) => a.day.localeCompare(b.day))
  }

  // Prepare data for device distribution
  const prepareDeviceData = () => {
    if (!events.length) return []

    const deviceCounts: Record<string, number> = {}

    events.forEach((event) => {
      if (event.metadata?.device) {
        const device = event.metadata.device
        deviceCounts[device] = (deviceCounts[device] || 0) + 1
      }
    })

    return Object.entries(deviceCounts).map(([device, count]) => ({
      name: device,
      value: count,
    }))
  }

  const timeSeriesData = prepareTimeSeriesData()
  const deviceData = prepareDeviceData()
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>
  }

  if (!test) {
    return <div className="flex justify-center p-8">Test not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/ab-testing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{test.name}</h1>
          <Badge variant={test.status === "active" ? "default" : "outline"}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </Badge>
        </div>
        <Button onClick={handleExportData}>
          <Download className="h-4 w-4 mr-1" /> Export Data
        </Button>
      </div>

      <div className="mb-6">
        <ABTestResults test={test} />
      </div>

      <Tabs defaultValue="timeline">
        <TabsList className="mb-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="events">Raw Events</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="impressions">
                <TabsList className="mb-4">
                  <TabsTrigger value="impressions">Impressions</TabsTrigger>
                  <TabsTrigger value="conversions">Conversions</TabsTrigger>
                  <TabsTrigger value="rates">Conversion Rates</TabsTrigger>
                </TabsList>

                <TabsContent value="impressions">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {test.variants.map((variant, index) => (
                        <Line
                          key={variant.id}
                          type="monotone"
                          dataKey={`${variant.name} Impressions`}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="conversions">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {test.variants.map((variant, index) => (
                        <Line
                          key={variant.id}
                          type="monotone"
                          dataKey={`${variant.name} Conversions`}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="rates">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {test.variants.map((variant, index) => (
                        <Line
                          key={variant.id}
                          type="monotone"
                          dataKey={`${variant.name} Rate`}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {deviceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No device data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional demographic charts can be added here */}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Raw Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Timestamp</th>
                      <th className="text-left p-2">User ID</th>
                      <th className="text-left p-2">Variant</th>
                      <th className="text-left p-2">Event</th>
                      <th className="text-left p-2">Metadata</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.length > 0 ? (
                      events
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .slice(0, 100) // Limit to 100 events for performance
                        .map((event, index) => {
                          const variant = test.variants.find((v) => v.id === event.variantId)
                          return (
                            <tr key={index} className="border-b">
                              <td className="p-2">{new Date(event.timestamp).toLocaleString()}</td>
                              <td className="p-2">{event.userId.substring(0, 8)}...</td>
                              <td className="p-2">{variant?.name || event.variantId}</td>
                              <td className="p-2">{event.eventName}</td>
                              <td className="p-2">{event.metadata ? JSON.stringify(event.metadata) : "-"}</td>
                            </tr>
                          )
                        })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center p-4">
                          No events recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {events.length > 100 && (
                  <div className="text-center mt-4 text-sm text-muted-foreground">
                    Showing 100 of {events.length} events. Export data to see all events.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
