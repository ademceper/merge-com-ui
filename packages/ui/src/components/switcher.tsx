"use client"

import * as React from "react"
import { cn } from "@merge-rd/ui/lib/utils"
import { CaretUpDownIcon } from "@phosphor-icons/react"
import {
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
  onManage?: () => void
  manageLabel?: string
}

function hashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

function hslToHex(h: number, s: number, l: number) {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, "0")
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function generateGradient(name: string) {
  const h = hashString(name)
  const h2 = hashString(name + "x")
  const h3 = hashString(name + "zz")
  const baseHue = h % 360
  const hue2 = (baseHue + 90 + h2 % 120) % 360
  const hue3 = (hue2 + 60 + h3 % 100) % 360
  const angle = 100 + (h >> 4) % 160
  const c1 = hslToHex(baseHue, 0.6 + (h2 % 30) / 100, 0.45 + (h3 % 20) / 100)
  const c2 = hslToHex(hue2, 0.55 + (h3 % 35) / 100, 0.5 + (h % 15) / 100)
  const c3 = hslToHex(hue3, 0.5 + (h % 30) / 100, 0.55 + (h2 % 15) / 100)
  const p1 = 15 + (h >> 8) % 20
  const p2 = 45 + (h >> 12) % 20
  return { colors: [c1, c2, c3], angle, stops: [p1, p2] }
}

function GradientAvatar({ name, className }: { name: string; className?: string }) {
  const { colors, angle, stops } = generateGradient(name)
  return (
    <span
      className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted", className)}
    >
      <span
        className="size-3.5 rounded-full"
        style={{
          background: `linear-gradient(${angle}deg, ${colors[0]} ${stops[0]}%, ${colors[1]} ${stops[1]}%, ${colors[2]} 100%)`,
        }}
      />
    </span>
  )
}

function Switcher({
  value,
  items = [],
  onChange,
  className,
  disabled,
  singleBadge,
  onManage,
  manageLabel = "Manage",
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
        <div className="flex h-5 min-w-[32px] items-center justify-center rounded-full border border-foreground/60 px-1.5 text-[10px] font-black text-foreground leading-none">
          {singleBadge || "V2"}
        </div>
      )}
      <span className="truncate text-[15px] font-semibold text-foreground/90 tracking-tight">
        {current?.label}
      </span>
    </div>
  )

  return (
    <div className={cn("relative w-full overflow-hidden rounded-xl bg-card", className)}>
      <div className="relative z-10 flex flex-col gap-1 rounded-xl bg-card/40 backdrop-blur-xl p-[3px]">
        {/* Üst Satır - Seçici popover */}
        {!isSingle ? (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger disabled={disabled} className="flex items-center justify-between w-full rounded-[9px] bg-sidebar px-2.5 py-2 outline-none">
              {triggerContent}
              <CaretUpDownIcon weight="bold" className="size-3.5 text-muted-foreground shrink-0" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-0 overflow-hidden bg-popover/50 backdrop-blur-xl divide-y divide-border">
              {groups.map((section, i) => (
                <div key={i}>
                  {section.map((item, j) => (
                    <div key={item.value}>
                      {j > 0 && <div className="h-px bg-border" />}
                      <div className="p-1">
                        <button
                          type="button"
                          className={cn(
                            "flex w-full cursor-default items-center gap-2.5 rounded-md px-2 py-1 outline-hidden select-none hover:bg-muted/50",
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
                        <GradientAvatar name={item.value} />
                      )}
                      <div className="flex flex-col items-start min-w-0 -space-y-0.5">
                        <span className="truncate text-sm font-semibold text-foreground/70 dark:text-foreground/60">{item.label}</span>
                        {item.description && (
                          <span className="truncate text-xs text-foreground/50 dark:text-foreground/40">{item.description}</span>
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
          <div className="flex items-center justify-between w-full rounded-[9px] px-2.5 py-2">
            {triggerContent}
          </div>
        )}

        {/* Arka plan gradyanı + grain doku */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(140deg,#d1d5db_0%,#d1d5db_40%,#0891b2_50%,#a21caf_60%,#c2410c_75%,#c2410c_100%)] opacity-60 blur-sm dark:bg-[linear-gradient(140deg,#161616_0%,#161616_40%,#0891b2_50%,#a21caf_60%,#c2410c_75%,#c2410c_100%)] dark:opacity-50" />
        <svg className="absolute inset-0 -z-10 size-full opacity-60 mix-blend-overlay" xmlns="http://www.w3.org/2000/svg">
          <filter id="switcher-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#switcher-noise)" />
        </svg>

        {/* Alt Satır */}
        <div className="flex items-center justify-center gap-4 px-2.5 py-1.5">
          <p className="text-[13px] font-medium text-foreground/70 truncate tracking-tight">
            Switch environment
          </p>
          {onManage && (
            <button
              type="button"
              className="shrink-0 rounded-[9px] bg-sidebar px-2.5 py-1.5 text-[11px] font-bold text-foreground hover:bg-sidebar-accent transition-colors"
              onClick={onManage}
            >
              {manageLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { Switcher }
