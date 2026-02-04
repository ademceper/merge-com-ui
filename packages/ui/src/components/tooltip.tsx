"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { useIsMobile } from "@merge/ui/hooks/use-mobile"
import { cn } from "@merge/ui/lib/utils"

const GlobalTooltipContext = React.createContext<{
  openTooltipId: string | null
  setOpenTooltipId: (id: string | null) => void
} | null>(null)

const TooltipMobileContext = React.createContext<{
  isMobile: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
} | null>(null)

export function TooltipProvider({
  delayDuration = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  const [openTooltipId, setOpenTooltipId] = React.useState<string | null>(null)

  return (
    <GlobalTooltipContext.Provider value={{ openTooltipId, setOpenTooltipId }}>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delayDuration={delayDuration}
        {...props}
      >
        {children}
      </TooltipPrimitive.Provider>
    </GlobalTooltipContext.Provider>
  )
}

export function Tooltip({
  open: openProp,
  onOpenChange: onOpenChangeProp,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const isMobile = useIsMobile()
  const globalContext = React.useContext(GlobalTooltipContext)
  const tooltipId = React.useId()
  
  const [openInternal, setOpenInternal] = React.useState(false)

  const isControlled = openProp !== undefined
  
  const open = React.useMemo(() => {
    if (!isMobile) return isControlled ? openProp : openInternal
    return globalContext?.openTooltipId === tooltipId
  }, [isMobile, isControlled, openProp, openInternal, globalContext?.openTooltipId, tooltipId])

  const onOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (!isMobile) {
        if (isControlled) {
          onOpenChangeProp?.(newOpen)
        } else {
          setOpenInternal(newOpen)
        }
        return
      }

      if (newOpen) {
        globalContext?.setOpenTooltipId(tooltipId)
      } else {
        if (globalContext?.openTooltipId === tooltipId) {
          globalContext?.setOpenTooltipId(null)
        }
      }

      // Controlled component callback'i
      if (isControlled) {
        onOpenChangeProp?.(newOpen)
      }
    },
    [isMobile, isControlled, onOpenChangeProp, globalContext, tooltipId]
  )

  const mobileContext = React.useMemo(
    () =>
      isMobile
        ? { isMobile: true, open, onOpenChange, id: tooltipId }
        : null,
    [isMobile, open, onOpenChange, tooltipId]
  )

  return (
    <TooltipMobileContext.Provider value={mobileContext}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        open={isMobile ? open : isControlled ? openProp : undefined}
        onOpenChange={isMobile ? undefined : onOpenChange}
        delayDuration={isMobile ? 0 : undefined}
        disableHoverableContent={isMobile}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipMobileContext.Provider>
  )
}

export function TooltipTrigger({
  onClick,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  const mobile = React.useContext(TooltipMobileContext)

  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      type="button"
      onClick={(e) => {
        if (mobile?.isMobile) {
          e.preventDefault()
          e.stopPropagation()
          mobile.onOpenChange(!mobile.open)
        }
        onClick?.(e)
      }}
      onPointerDown={(e) => {
        if (mobile?.isMobile) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      {...props}
    />
  )
}

export function TooltipContent({
  className,
  sideOffset = 4,
  children,
  onPointerDownOutside,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  const mobile = React.useContext(TooltipMobileContext)

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        onPointerDownOutside={(e) => {
          if (mobile?.isMobile) {
            e.preventDefault()
            e.stopPropagation()
            mobile.onOpenChange(false)
          }
          onPointerDownOutside?.(e)
        }}
        onEscapeKeyDown={() => {
          if (mobile?.isMobile) {
            mobile.onOpenChange(false)
          }
        }}
        className={cn(
          "z-50 overflow-visible rounded-md bg-foreground px-3 py-1.5 text-xs text-background",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-200",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "max-w-xs",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow 
          className="fill-foreground [transition:inherit]"
        />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}