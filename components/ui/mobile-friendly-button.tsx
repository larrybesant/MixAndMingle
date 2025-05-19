"use client"

import { forwardRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

export interface MobileFriendlyButtonProps extends ButtonProps {
  mobileFullWidth?: boolean
  mobilePadding?: string
}

const MobileFriendlyButton = forwardRef<HTMLButtonElement, MobileFriendlyButtonProps>(
  ({ className, children, mobileFullWidth = true, mobilePadding, ...props }, ref) => {
    const isMobile = useMobile()

    return (
      <Button
        className={cn(
          isMobile && mobileFullWidth && "w-full",
          isMobile && mobilePadding && mobilePadding,
          isMobile && "min-h-[44px]", // Apple's recommended minimum tap target size
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    )
  },
)
MobileFriendlyButton.displayName = "MobileFriendlyButton"

export { MobileFriendlyButton }
