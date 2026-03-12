"use client"

import { cn } from "@merge-rd/ui/lib/utils"
import { SizeType } from "../types"
import { ArrowBendDownLeft } from "@phosphor-icons/react"

interface FilterInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  size: SizeType
  showEnterIcon?: boolean
}

export function FilterInput({
  inputRef,
  value,
  onChange,
  placeholder,
  size,
  showEnterIcon = false,
}: FilterInputProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "w-full flex-1 border-none bg-transparent outline-none shadow-none ring-0 placeholder:text-muted-foreground min-w-0",
          size === "small" ? "h-6 text-xs" : "h-8",
          "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
          "text-neutral-600 dark:text-neutral-300"
        )}
      />
      {showEnterIcon && (
        <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 p-0.5 dark:border-neutral-700">
          <ArrowBendDownLeft className="h-3 w-3 text-neutral-200 dark:text-neutral-600" />
        </div>
      )}
    </div>
  )
}
