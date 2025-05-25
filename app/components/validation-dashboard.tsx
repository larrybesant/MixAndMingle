"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from "lucide-react"

interface ValidationStep {
  id: string
  title: string
  description: string
  status: "pending" | "running" | "success" | "error"
  command?: string
  result?: string
}

export function ValidationDashboard() {
  const [steps, setSteps] = useState<ValidationStep[]>([
    {
      id: "lint",
      title: "Code Quality & Lint Check",
      description: "Check for syntax issues, type mismatches, and formatting errors",
      status: "pending",
      command: "npm run lint && tsc --noEmit",
    },
    {
      id: "audit",
      title: "Security Audit",
      description: "Fix outdated or vulnerable packages",
      status: "pending",
      command: "npm audit fix --force && npm install",
    },
    {
      id: "env",
      title: "Environment Variables",
      description: "Validate environment configuration",
      status: "pending",
      command: 'Get-ChildItem Env: | Where-Object { $_.Name -match "DATABASE_URL|NEXT_PUBLIC_" }',
    },
    {
      id: "build",
      title: "Build Stability Test",
      description: "Test Next.js build for runtime errors",
      status: "pending",
      command: "npm run build 2>&1 | Out-File build.log",
    },
    {
      id: "api",
      title: "API Functionality",
      description: "Test API responses and backend logs",
      status: "pending",
      command: 'Invoke-WebRequest -Uri "https://v0-mix-and-mingle-larrybesants-projects.vercel.app/api/test"',
    },
    {
      id: "database",
      title: "Database Connection",
      description: "Verify PostgreSQL connection and data integrity",
      status: "pending",
      command: 'psql -U your_user -d your_database -c "SELECT COUNT(*) FROM users;"',
    },
    {
      id: "deployment",
      title: "Deployment Health",
      description: "Check Vercel settings and GitHub sync",
      status: "pending",
      command: "vercel inspect v0-mix-and-mingle && vercel git ls",
    },
    {
      id: "ports",
      title: "Network Configuration",
      description: "Validate open ports and firewall rules",
      status: "pending",
      command: 'netstat -ano | Select-String "3000|5432"',
    },
  ])

  const runStep = async (stepId: string) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status: "running" } : step)))

    // Simulate running the validation step
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate random success/failure for demo
    const success = Math.random() > 0.3

    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              status: success ? "success" : "error",
              result: success ? "Validation passed successfully" : "Issues detected - check logs",
            }
          : step,
      ),
    )
  }

  const runAllSteps = async () => {
    for (const step of steps) {
      await runStep(step.id)
    }
  }

  const getStatusIcon = (status: ValidationStep["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ValidationStep["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Passed
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Failed</Badge>
      case "running":
        return <Badge variant="secondary">Running...</Badge>
      default:
        return <Badge variant="outline">Pending</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mix & Mingle</h1>
        <p className="text-xl text-gray-600">Code Quality & Deployment Validation</p>
      </div>

      <div className="mb-6 flex gap-4">
        <Button onClick={runAllSteps} className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Run All Validations
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <Tabs defaultValue="validation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="validation">Validation Steps</TabsTrigger>
          <TabsTrigger value="commands">PowerShell Commands</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status)}
                  <div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    <CardDescription>{step.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(step.status)}
                  <Button size="sm" onClick={() => runStep(step.id)} disabled={step.status === "running"}>
                    Run
                  </Button>
                </div>
              </CardHeader>
              {step.result && (
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <code className="text-sm">{step.result}</code>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="commands">
          <Card>
            <CardHeader>
              <CardTitle>PowerShell Commands Reference</CardTitle>
              <CardDescription>Copy and run these commands in your terminal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step) => (
                <div key={step.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
                    <code>{step.command}</code>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment">
          <DeploymentGuide />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DeploymentGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🚀 Final Deployment Steps</CardTitle>
          <CardDescription>Complete these steps after all validations pass</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h3 className="font-semibold">1. Service Restart</h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
              <code>Restart-Service -Name "MpsSvc"</code>
              <br />
              <code>Restart-Service -Name "PostgreSQL"</code>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">2. Production Deployment</h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
              <code>vercel deploy --prod</code>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">3. End-to-End Testing</h3>
            <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
              <code>npx cypress open</code>
              <br />
              <code>npx playwright test</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Pre-Deployment Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              "All lint errors resolved",
              "Security vulnerabilities patched",
              "Environment variables configured",
              "Build completes without errors",
              "API endpoints responding correctly",
              "Database connections stable",
              "Vercel deployment settings verified",
              "Network ports properly configured",
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
