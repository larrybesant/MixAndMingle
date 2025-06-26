import type React from "react"

export function SimpleCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow p-6 ${className}`}>{children}</div>
}

export function SimpleCardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>
}

export function SimpleCardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-2xl font-semibold ${className}`}>{children}</h2>
}

export function SimpleCardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
