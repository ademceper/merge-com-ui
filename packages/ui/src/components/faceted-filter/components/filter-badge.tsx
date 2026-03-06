"use client"

import { cn } from "@merge-rd/ui/lib/utils"
import { STYLES } from "../styles"
import { SizeType } from "../types"

interface FilterBadgeProps {
  content: React.ReactNode
  size: SizeType
  className?: string
}

export function FilterBadge({ content, size, className }: FilterBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-neutral-100 bg-neutral-50 font-normal text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        "transition-colors duration-200 ease-out",
        "hover:border-neutral-200/70 hover:bg-neutral-100/50 hover:text-neutral-700 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/50 dark:hover:text-neutral-200",
        STYLES.size[size].badge,
        className
      )}
    >
      {content}
    </span>
  )
}
