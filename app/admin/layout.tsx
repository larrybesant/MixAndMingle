import type React from "react"
import type { Metadata } from "next"
import AdminSidebar from "./components/admin-sidebar"
import AdminHeader from "./components/admin-header"

export const metadata: Metadata = {
  title: "Mix & Mingle Admin",
  description: "Admin dashboard for Mix & Mingle application",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
