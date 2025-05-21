import type { Metadata } from "next"
import { BugReportDashboard } from "@/components/admin/bug-report-dashboard"

export const metadata: Metadata = {
  title: "Bug Reports | Mix & Mingle Admin",
  description: "Manage and track bug reports from beta testers",
}

export default function BugReportsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Bug Reports</h1>
      <BugReportDashboard />
    </div>
  )
}
