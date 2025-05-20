import { BetaTesterDashboard } from "@/components/admin/beta-tester-dashboard"

export const metadata = {
  title: "Beta Tester Management | Mix & Mingle Admin",
  description: "Manage and monitor beta testers for Mix & Mingle",
}

export default function BetaTestersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Beta Tester Management</h1>
      <BetaTesterDashboard />
    </div>
  )
}
