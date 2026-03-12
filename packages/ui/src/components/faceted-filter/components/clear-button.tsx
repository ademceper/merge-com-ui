"use client"

import { cn } from "@merge-rd/ui/lib/utils"
import { Button } from "@merge-rd/ui/components/button"

interface ClearButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export function ClearButton({
  onClick,
  label = "Clear filter",
  className,
}: ClearButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "justify-center px-0 text-xs text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 dark:hover:text-neutral-50",
        className
      )}
    >
      {label}
    </Button>
  )
}
