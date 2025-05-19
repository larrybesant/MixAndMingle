import { requireAdmin } from "@/lib/auth/server-auth"
import Link from "next/link"

export default async function AdminDashboardPage() {
  // This will redirect if not admin
  await requireAdmin()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Simple Admin Page</h2>
          <p className="mb-4">A simple admin page for testing.</p>
          <Link href="/admin/simple" className="text-blue-600 hover:underline">
            View Simple Admin Page
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Client Test</h2>
          <p className="mb-4">A client component test page.</p>
          <Link href="/client-test" className="text-blue-600 hover:underline">
            View Client Test
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Test Page</h2>
          <p className="mb-4">A simple test page.</p>
          <Link href="/test-page" className="text-blue-600 hover:underline">
            View Test Page
          </Link>
        </div>
      </div>
    </div>
  )
}
