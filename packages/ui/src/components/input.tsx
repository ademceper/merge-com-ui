import * as React from "react"

import { cn } from "@merge/ui/lib/utils"

export function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 rounded-lg bg-muted dark:bg-input/30 border-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring px-2.5 py-1 transition-colors w-full min-w-0 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-input/50 dark:disabled:bg-input/80 aria-invalid:ring-destructive/20 aria-invalid:ring-2 file:inline-flex file:border-0 file:bg-transparent file:text-foreground file:h-6 file:text-sm file:font-medium md:text-sm text-base",
        className
      )}
      {...props}
    />
  )
}
