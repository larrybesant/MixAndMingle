import type React from "react"
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-4 bg-white shadow mb-4">
        <div className="container">
          <h1 className="text-2xl font-bold">Admin Area</h1>
        </div>
      </div>
      {children}
    </div>
  )
}
