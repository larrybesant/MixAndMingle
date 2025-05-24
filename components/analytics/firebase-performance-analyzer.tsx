"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Clock, Database, TrendingUp, AlertTriangle, Activity, Target, Gauge } from "lucide-react"
import { signUpWithEmail, signInWithEmail, getUserData } from "@/lib/auth"
import { createChatRoom, sendMessage, getChatRooms, updateUserProfile } from "@/lib/firestore"

interface PerformanceMetric {
  operation: string
  category: "auth" | "firestore" | "realtime" | "storage"
  attempts: number
  successes: number
  failures: number
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  errorRate: number
  throughput: number
}

interface OptimizationRecommendation {
  category: string
  issue: string
  impact: "high" | "medium" | "low"
  recommendation: string
  estimatedImprovement: string
}

interface BenchmarkData {
  operation: string
  currentPerformance: number
  industryBenchmark: number
  status: "excellent" | "good" | "needs-improvement" | "poor"
}

export default function FirebasePerformanceAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([])
  const [analysisLog, setAnalysisLog] = useState<string[]>([])
  const [overallScore, setOverallScore] = useState(0)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setAnalysisLog((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const measureOperation = async (
    operationName: string,
    operation: () => Promise<any>,
    iterations = 5,
  ): Promise<PerformanceMetric> => {
    const times: number[] = []
    let successes = 0
    let failures = 0

    addLog(`📊 Testing ${operationName} (${iterations} iterations)...`)

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      try {
        await operation()
        const endTime = performance.now()
        const duration = endTime - startTime
        times.push(duration)
        successes++
        addLog(`  ✅ Iteration ${i + 1}: ${duration.toFixed(2)}ms`)
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        times.push(duration)
        failures++
        addLog(`  ❌ Iteration ${i + 1}: Failed after ${duration.toFixed(2)}ms`)
      }

      // Small delay between iterations
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    const avgResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length
    const sortedTimes = times.sort((a, b) => a - b)
    const p95Index = Math.floor(times.length * 0.95)

    return {
      operation: operationName,
      category: operationName.includes("auth") ? "auth" : operationName.includes("message") ? "realtime" : "firestore",
      attempts: iterations,
      successes,
      failures,
      avgResponseTime,
      minResponseTime: Math.min(...times),
      maxResponseTime: Math.max(...times),
      p95ResponseTime: sortedTimes[p95Index] || avgResponseTime,
      errorRate: (failures / iterations) * 100,
      throughput: 1000 / avgResponseTime, // operations per second
    }
  }

  const runPerformanceAnalysis = async () => {
    setIsAnalyzing(true)
    setProgress(0)
    setMetrics([])
    setRecommendations([])
    setAnalysisLog([])

    addLog("🚀 Starting comprehensive Firebase performance analysis...")

    const testOperations = [
      {
        name: "User Authentication (Sign Up)",
        operation: async () => {
          const timestamp = Date.now()
          return signUpWithEmail(
            `perf.test.${timestamp}@example.com`,
            "TestPassword123!",
            "Perf",
            "Test",
            `perftest${timestamp}`,
          )
        },
        iterations: 3,
      },
      {
        name: "User Authentication (Sign In)",
        operation: async () => {
          // Use a known test account
          return signInWithEmail("test@example.com", "password123")
        },
        iterations: 5,
      },
      {
        name: "Firestore User Data Read",
        operation: async () => {
          return getUserData("test-user-id")
        },
        iterations: 10,
      },
      {
        name: "Chat Room Creation",
        operation: async () => {
          return createChatRoom({
            name: `Perf Test Room ${Date.now()}`,
            description: "Performance testing room",
            type: "public",
            createdBy: "test-user-id",
            members: ["test-user-id"],
          })
        },
        iterations: 5,
      },
      {
        name: "Chat Rooms Query",
        operation: async () => {
          return getChatRooms()
        },
        iterations: 10,
      },
      {
        name: "Message Sending",
        operation: async () => {
          return sendMessage({
            roomId: "test-room-id",
            senderId: "test-user-id",
            senderName: "Performance Test",
            senderAvatar: "",
            text: `Performance test message ${Date.now()}`,
            type: "text",
          })
        },
        iterations: 8,
      },
      {
        name: "User Profile Update",
        operation: async () => {
          return updateUserProfile("test-user-id", {
            bio: `Updated at ${Date.now()}`,
          })
        },
        iterations: 5,
      },
    ]

    const results: PerformanceMetric[] = []

    for (let i = 0; i < testOperations.length; i++) {
      const test = testOperations[i]
      setProgress((i / testOperations.length) * 100)

      try {
        const metric = await measureOperation(test.name, test.operation, test.iterations)
        results.push(metric)
        addLog(`📈 ${test.name} completed: ${metric.avgResponseTime.toFixed(2)}ms avg`)
      } catch (error) {
        addLog(`❌ ${test.name} failed: ${error}`)
      }
    }

    setMetrics(results)
    setProgress(100)

    // Generate recommendations
    const recs = generateRecommendations(results)
    setRecommendations(recs)

    // Generate benchmarks
    const bench = generateBenchmarks(results)
    setBenchmarks(bench)

    // Calculate overall score
    const score = calculateOverallScore(results)
    setOverallScore(score)

    addLog("🎉 Performance analysis completed!")
    setIsAnalyzing(false)
  }

  const generateRecommendations = (metrics: PerformanceMetric[]): OptimizationRecommendation[] => {
    const recommendations: OptimizationRecommendation[] = []

    metrics.forEach((metric) => {
      // High response time recommendations
      if (metric.avgResponseTime > 2000) {
        recommendations.push({
          category: metric.category,
          issue: `High response time for ${metric.operation}`,
          impact: "high",
          recommendation: "Consider implementing caching, optimizing queries, or using Firestore offline persistence",
          estimatedImprovement: "50-70% faster response times",
        })
      }

      // High error rate recommendations
      if (metric.errorRate > 10) {
        recommendations.push({
          category: metric.category,
          issue: `High error rate for ${metric.operation}`,
          impact: "high",
          recommendation: "Implement retry logic, improve error handling, and add connection monitoring",
          estimatedImprovement: "80-90% reduction in errors",
        })
      }

      // Low throughput recommendations
      if (metric.throughput < 1) {
        recommendations.push({
          category: metric.category,
          issue: `Low throughput for ${metric.operation}`,
          impact: "medium",
          recommendation: "Optimize database indexes, use batch operations, or implement connection pooling",
          estimatedImprovement: "2-3x throughput improvement",
        })
      }

      // P95 latency recommendations
      if (metric.p95ResponseTime > metric.avgResponseTime * 2) {
        recommendations.push({
          category: metric.category,
          issue: `High P95 latency variance for ${metric.operation}`,
          impact: "medium",
          recommendation: "Implement request queuing, optimize cold starts, or use CDN for static assets",
          estimatedImprovement: "30-50% more consistent performance",
        })
      }
    })

    // General recommendations
    recommendations.push({
      category: "general",
      issue: "Firestore query optimization",
      impact: "medium",
      recommendation: "Use composite indexes, limit query results, and implement pagination",
      estimatedImprovement: "20-40% faster queries",
    })

    recommendations.push({
      category: "general",
      issue: "Authentication performance",
      impact: "low",
      recommendation: "Implement session persistence and reduce auth state checks",
      estimatedImprovement: "10-20% faster auth operations",
    })

    return recommendations
  }

  const generateBenchmarks = (metrics: PerformanceMetric[]): BenchmarkData[] => {
    const benchmarkData: BenchmarkData[] = []

    const industryBenchmarks = {
      "User Authentication (Sign Up)": 1500,
      "User Authentication (Sign In)": 800,
      "Firestore User Data Read": 300,
      "Chat Room Creation": 1000,
      "Chat Rooms Query": 500,
      "Message Sending": 600,
      "User Profile Update": 800,
    }

    metrics.forEach((metric) => {
      const benchmark = industryBenchmarks[metric.operation as keyof typeof industryBenchmarks] || 1000
      const ratio = metric.avgResponseTime / benchmark

      let status: BenchmarkData["status"]
      if (ratio <= 0.8) status = "excellent"
      else if (ratio <= 1.2) status = "good"
      else if (ratio <= 2.0) status = "needs-improvement"
      else status = "poor"

      benchmarkData.push({
        operation: metric.operation,
        currentPerformance: metric.avgResponseTime,
        industryBenchmark: benchmark,
        status,
      })
    })

    return benchmarkData
  }

  const calculateOverallScore = (metrics: PerformanceMetric[]): number => {
    if (metrics.length === 0) return 0

    let totalScore = 0
    metrics.forEach((metric) => {
      let score = 100

      // Deduct points for high response times
      if (metric.avgResponseTime > 1000) score -= 20
      if (metric.avgResponseTime > 2000) score -= 30

      // Deduct points for errors
      score -= metric.errorRate * 2

      // Deduct points for low throughput
      if (metric.throughput < 1) score -= 15

      totalScore += Math.max(0, score)
    })

    return Math.round(totalScore / metrics.length)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusColor = (status: BenchmarkData["status"]) => {
    switch (status) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "needs-improvement":
        return "text-yellow-600"
      case "poor":
        return "text-red-600"
    }
  }

  const chartData = metrics.map((metric) => ({
    name: metric.operation.replace("User Authentication ", "Auth ").replace("Firestore ", ""),
    avgTime: Math.round(metric.avgResponseTime),
    p95Time: Math.round(metric.p95ResponseTime),
    errorRate: metric.errorRate,
    throughput: metric.throughput,
  }))

  const categoryData = metrics.reduce(
    (acc, metric) => {
      const category = metric.category
      if (!acc[category]) {
        acc[category] = { category, avgTime: 0, count: 0, errors: 0 }
      }
      acc[category].avgTime += metric.avgResponseTime
      acc[category].count += 1
      acc[category].errors += metric.failures
      return acc
    },
    {} as Record<string, any>,
  )

  const categoryChartData = Object.values(categoryData).map((data: any) => ({
    name: data.category,
    avgTime: Math.round(data.avgTime / data.count),
    errors: data.errors,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Firebase Performance Analysis</h1>
        <p className="text-gray-600">
          Comprehensive analysis of Firebase operation speeds, success rates, and optimization opportunities
        </p>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Performance Analysis Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runPerformanceAnalysis} disabled={isAnalyzing} size="lg" className="w-full">
            {isAnalyzing ? (
              <>
                <Gauge className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Performance... ({Math.round(progress)}%)
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Start Performance Analysis
              </>
            )}
          </Button>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-gray-600 text-center">Running comprehensive Firebase performance tests...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Score */}
      {overallScore > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-blue-600">{metrics.length}</div>
              <div className="text-sm text-gray-600">Operations Tested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-green-600">
                {metrics.reduce((sum, m) => sum + m.successes, 0)}
              </div>
              <div className="text-sm text-gray-600">Successful Operations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-purple-600">
                {Math.round(metrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / metrics.length || 0)}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analysis Results */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="charts">Visual Analysis</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="logs">Analysis Log</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive breakdown of Firebase operation performance</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No metrics available. Run the performance analysis to see results.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {metrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{metric.operation}</h4>
                        <Badge variant={metric.errorRate > 10 ? "destructive" : "default"}>{metric.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Avg Response</p>
                          <p className="font-medium">{metric.avgResponseTime.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <p className="text-gray-600">P95 Response</p>
                          <p className="font-medium">{metric.p95ResponseTime.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Success Rate</p>
                          <p className="font-medium">{((metric.successes / metric.attempts) * 100).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Throughput</p>
                          <p className="font-medium">{metric.throughput.toFixed(2)} ops/s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avgTime" fill="#8884d8" name="Avg Time (ms)" />
                    <Bar dataKey="p95Time" fill="#82ca9d" name="P95 Time (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}ms`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="avgTime"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Throughput Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="throughput" stroke="#8884d8" name="Throughput (ops/s)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry Benchmark Comparison</CardTitle>
              <CardDescription>How your Firebase performance compares to industry standards</CardDescription>
            </CardHeader>
            <CardContent>
              {benchmarks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No benchmark data available. Run the analysis to see comparisons.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {benchmarks.map((benchmark, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{benchmark.operation}</h4>
                        <p className="text-sm text-gray-600">
                          Current: {benchmark.currentPerformance.toFixed(0)}ms | Industry: {benchmark.industryBenchmark}
                          ms
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            benchmark.status === "excellent" || benchmark.status === "good" ? "default" : "destructive"
                          }
                          className={getStatusColor(benchmark.status)}
                        >
                          {benchmark.status.replace("-", " ")}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {((benchmark.currentPerformance / benchmark.industryBenchmark) * 100).toFixed(0)}% of
                          benchmark
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Actionable insights to improve Firebase performance</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recommendations available. Run the analysis to get optimization suggestions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{rec.issue}</h4>
                        <Badge
                          variant={
                            rec.impact === "high" ? "destructive" : rec.impact === "medium" ? "default" : "secondary"
                          }
                        >
                          {rec.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.recommendation}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Expected improvement: {rec.estimatedImprovement}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Execution Log</CardTitle>
              <CardDescription>Detailed log of performance testing execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                {analysisLog.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No logs available. Start the analysis to see execution details.</p>
                  </div>
                ) : (
                  <div className="space-y-1 font-mono text-sm">
                    {analysisLog.map((log, index) => (
                      <div key={index} className="text-gray-800">
                        {log}
                      </div>
                    ))}
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
