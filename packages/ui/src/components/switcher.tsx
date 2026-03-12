"use client"

import * as React from "react"
import { cn } from "@merge-rd/ui/lib/utils"
import { CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react"
import {
  PopoverAvatar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@merge-rd/ui/components/popover"

export interface SwitcherItem {
  value: string
  label: string
  description?: string
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
  singleBadge?: string
  children?: React.ReactNode
}

function Switcher({
  value,
  items = [],
  onChange,
  className,
  disabled,
  children,
}: SwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const current = items.find((item) => item.value === value)
  const isSingle = items.length <= 1

  const groups = React.useMemo(() => {
    const ungrouped: SwitcherItem[] = []
    const grouped = new Map<string, SwitcherItem[]>()
    for (const item of items) {
      if (!item.group) ungrouped.push(item)
      else {
        const list = grouped.get(item.group) ?? []
        list.push(item)
        grouped.set(item.group, list)
      }
    }
    const sections: SwitcherItem[][] = []
    if (ungrouped.length > 0) sections.push(ungrouped)
    for (const list of grouped.values()) sections.push(list)
    return sections
  }, [items])

  const triggerContent = (
    <div className="flex items-center gap-3 min-w-0">
      {current?.icon ? (
        <span className="shrink-0">{current.icon}</span>
      ) : (
        <PopoverAvatar name={current?.value ?? ""} />
      )}
      <span className="truncate text-[15px] font-semibold text-foreground/90 tracking-tight">
        {current?.label}
      </span>
    </div>
  )

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl bg-card", className)}>
      <div className="relative z-10 flex flex-col gap-1 rounded-xl bg-card/40 backdrop-blur-xl p-[3px]">
        {!isSingle ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger disabled={disabled} className="group/trigger flex items-center justify-between w-full rounded-[9px] bg-sidebar px-2.5 py-1.5 outline-none">
              {triggerContent}
              <div className="flex flex-col shrink-0 opacity-0 group-hover/trigger:opacity-100 transition-opacity duration-200 ease-out">
                <CaretUpIcon weight="bold" className="size-2.5 text-muted-foreground -translate-y-1 group-hover/trigger:translate-y-0 transition-transform duration-200 ease-out" />
                <CaretDownIcon weight="bold" className="size-2.5 text-muted-foreground translate-y-1 group-hover/trigger:translate-y-0 transition-transform duration-200 ease-out" />
              </div>
            </PopoverTrigger>
            <PopoverContent align="start">
              {groups.map((section, i) => (
                <div key={i}>
                  {section.map((item, j) => (
                    <div key={item.value}>
                      {j > 0 && <div className="h-px bg-border" />}
                      <div className="p-1">
                        <button
                          type="button"
                          className={cn(
                            "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 outline-hidden select-none hover:bg-muted/50",
                            item.value === value && "bg-accent/50"
                          )}
                      onClick={() => {
                        onChange?.(item.value)
                        setIsOpen(false)
                      }}
                    >
                      {item.icon ? (
                        <span className="flex size-5 shrink-0 items-center justify-center">{item.icon}</span>
                      ) : (
                        <PopoverAvatar name={item.value} />
                      )}
                      <div className="flex flex-col items-start min-w-0 -space-y-0.5">
                        <span className="max-w-full truncate text-left text-sm text-foreground/70 dark:text-foreground/60">{item.label}</span>
                        {item.description && (
                          <span className="max-w-full truncate text-left text-xs text-foreground/50 dark:text-foreground/40">{item.description}</span>
                        )}
                      </div>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </PopoverContent>
          </Popover>
        ) : (
          <div className="flex items-center justify-between w-full rounded-[9px] bg-sidebar px-2.5 py-1.5">
            {triggerContent}
          </div>
        )}

        <div className="absolute inset-0 -z-10 bg-[linear-gradient(140deg,#d1d5db_0%,#d1d5db_40%,#0891b2_50%,#a21caf_60%,#c2410c_75%,#c2410c_100%)] opacity-60 blur-sm dark:bg-[linear-gradient(140deg,#161616_0%,#161616_40%,#0891b2_50%,#a21caf_60%,#c2410c_75%,#c2410c_100%)] dark:opacity-50" />
        <svg className="absolute inset-0 -z-10 size-full opacity-60 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id="switcher-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#switcher-noise)" />
        </svg>

        {children && (
          <div className="flex items-center justify-center gap-4 px-2 py-1.5">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}

export { Switcher }
