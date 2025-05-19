"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  secondaryActionLabel?: string
  secondaryActionHref?: string
  secondaryActionOnClick?: () => void
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionHref,
  secondaryActionOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      {icon && <div className="text-muted-foreground mb-4 text-4xl">{icon}</div>}
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel &&
          (actionHref || actionOnClick) &&
          (actionHref ? (
            <Button asChild className="min-w-[120px]">
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button onClick={actionOnClick} className="min-w-[120px]">
              {actionLabel}
            </Button>
          ))}

        {secondaryActionLabel &&
          (secondaryActionHref || secondaryActionOnClick) &&
          (secondaryActionHref ? (
            <Button variant="outline" asChild className="min-w-[120px]">
              <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={secondaryActionOnClick} className="min-w-[120px]">
              {secondaryActionLabel}
            </Button>
          ))}
      </div>
    </div>
  )
}
