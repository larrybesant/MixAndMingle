import { requireAdmin } from "@/lib/auth/server-auth"

export default async function SimpleAdminPage() {
  // This will redirect if not admin
  const user = await requireAdmin()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Simple Admin Page</h1>
      <p>This is a simple admin page that doesn't use any complex components.</p>
      <p>User ID: {user.id}</p>
      <p>Email: {user.email}</p>
    </div>
  )
}
