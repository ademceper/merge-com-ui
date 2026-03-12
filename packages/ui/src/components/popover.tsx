"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@merge-rd/ui/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" className={cn("cursor-pointer", className)} {...props} />
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 cursor-pointer origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-lg bg-popover/50 p-0 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden backdrop-blur-xl divide-y divide-border duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-0.5 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <div
      data-slot="popover-title"
      className={cn("font-medium", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
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

function PopoverAvatar({ name, className }: { name: string; className?: string }) {
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

export {
  PopoverAvatar,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
