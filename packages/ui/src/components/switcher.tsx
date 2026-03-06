"use client"

import * as React from "react"
import { cn } from "@merge-rd/ui/lib/utils"
import { ArrowsDownUp, CheckIcon } from "@phosphor-icons/react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@merge-rd/ui/components/popover"

export interface SwitcherItem {
  value: string
  label: string
  color?: string
  icon?: React.ReactNode
  group?: string
}

export interface SwitcherProps {
  value?: string
  items?: SwitcherItem[]
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
}

function ColorDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn("size-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  )
}

function Switcher({
  value,
  items = [],
  onChange,
  className,
  disabled,
}: SwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const current = items.find((item) => item.value === value)
  const isSingle = items.length <= 1

  const groups = React.useMemo(() => {
    const ungrouped: SwitcherItem[] = []
    const grouped = new Map<string, SwitcherItem[]>()

    for (const item of items) {
      if (!item.group) {
        ungrouped.push(item)
      } else {
        const list = grouped.get(item.group) ?? []
        list.push(item)
        grouped.set(item.group, list)
      }
    }

    const sections: SwitcherItem[][] = []
    if (ungrouped.length > 0) sections.push(ungrouped)
    for (const list of grouped.values()) {
      sections.push(list)
    }
    return sections
  }, [items])

  return (
    <Popover open={isSingle ? false : isOpen} onOpenChange={isSingle ? undefined : setIsOpen}>
      <PopoverTrigger
        disabled={disabled}
        className={cn(
          "group flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-transparent p-1.5 text-sm shadow-sm transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
          className
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {current?.icon ?? (current?.color ? <ColorDot color={current.color} /> : null)}
          <span className="truncate text-sm text-foreground">
            {current?.label}
          </span>
        </div>
        {!isSingle && (
          <ArrowsDownUp className="ml-auto size-4 shrink-0 text-muted-foreground opacity-0 transition duration-300 ease-out group-focus-within:opacity-100 group-hover:opacity-100" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) gap-1 p-1"
      >
        {groups.map((section, i) => (
          <React.Fragment key={i}>
            {i > 0 && <div className="mx-1 h-px bg-border" />}
            {section.map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(
                  "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground",
                  item.value === value && "bg-accent/50"
                )}
                onClick={() => {
                  onChange?.(item.value)
                  setIsOpen(false)
                }}
              >
                {item.icon ?? (item.color ? <ColorDot color={item.color} /> : null)}
                <span className="truncate">{item.label}</span>
                {item.value === value && (
                  <CheckIcon className="absolute right-2 size-4" />
                )}
              </button>
            ))}
          </React.Fragment>
        ))}
      </PopoverContent>
    </Popover>
  )
}

export { Switcher }
