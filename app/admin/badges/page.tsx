import { BadgeManager } from "@/components/admin/badge-manager"

export default function AdminBadgesPage() {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Badge Management</h1>
      <BadgeManager />
    </div>
  )
}
