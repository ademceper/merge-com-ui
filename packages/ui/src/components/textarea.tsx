import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@merge-rd/ui/lib/utils"

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-lg px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-transparent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:bg-input/50 dark:bg-input/30 dark:disabled:bg-input/80",
        secondary:
          "border-0 bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>

function Textarea({ className, variant = "default", ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
