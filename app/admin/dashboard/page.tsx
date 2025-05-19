import { redirect } from "next/navigation"
import { AdminDashboardClient } from "./admin-dashboard-client"
import { getCurrentUser, checkIsAdmin } from "@/lib/supabase/server-actions"

export default async function AdminDashboardPage() {
  // Server-side authentication and authorization
  const user = await getCurrentUser()

  if (!user) {
    redirect("/signin?redirect=/admin/dashboard")
  }

  const isAdmin = await checkIsAdmin(user.id)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Pass data to client component
  return <AdminDashboardClient userId={user.id} />
}
