import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UsersIcon, MessageSquareIcon, BugIcon, LightbulbIcon, CheckSquareIcon, PercentIcon } from "lucide-react"

interface BetaMetrics {
  totalTesters: number
  activeTesters: number
  totalFeedback: number
  bugReports: number
  suggestions: number
  generalFeedback: number
  averageTasksCompleted: number
  completionRate: number
}

interface BetaOverviewMetricsProps {
  metrics: BetaMetrics
}

export function BetaOverviewMetrics({ metrics }: BetaOverviewMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Beta Testers</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTesters}</div>
          <p className="text-xs text-muted-foreground">{metrics.activeTesters} active in selected period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback Items</CardTitle>
          <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalFeedback}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.bugReports} bugs, {metrics.suggestions} suggestions, {metrics.generalFeedback} general
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bug Reports</CardTitle>
          <BugIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.bugReports}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalFeedback > 0 ? Math.round((metrics.bugReports / metrics.totalFeedback) * 100) : 0}% of all
            feedback
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Feature Suggestions</CardTitle>
          <LightbulbIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.suggestions}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalFeedback > 0 ? Math.round((metrics.suggestions / metrics.totalFeedback) * 100) : 0}% of all
            feedback
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Tasks Completed</CardTitle>
          <CheckSquareIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageTasksCompleted.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">Out of 10 total tasks</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <PercentIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">Active testers / total testers</p>
        </CardContent>
      </Card>
    </div>
  )
}
