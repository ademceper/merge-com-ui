"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { ArrowBendUpLeftIcon, XIcon } from "@phosphor-icons/react"

import { cn } from "@merge-rd/ui/lib/utils"
import { Button } from "@merge-rd/ui/components/button"
import { Separator } from "@merge-rd/ui/components/separator"
import { useIsMobile } from "@merge-rd/ui/hooks/use-mobile"

const TRAY_WIDTH = "21rem"
const TRAY_KEYBOARD_SHORTCUT = "Escape"

type TrayContextProps = {
  state: "open" | "closed"
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
}

const TrayContext = React.createContext<TrayContextProps | null>(null)

function useTray() {
  const context = React.useContext(TrayContext)
  if (!context) {
    throw new Error("useTray must be used within a TrayProvider.")
  }

  return context
}

function TrayProvider({
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()

  // This is the internal state of the tray.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(false)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (setOpenProp) {
        setOpenProp(value)
      } else {
        _setOpen(value)
      }
    },
    [setOpenProp]
  )

  // Helper to toggle the tray.
  const toggle = React.useCallback(() => {
    setOpen(!open)
  }, [setOpen, open])

  // Adds a keyboard shortcut to close the tray.
  React.useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === TRAY_KEYBOARD_SHORTCUT) {
        event.preventDefault()
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  // We add a state so that we can do data-state="open" or "closed".
  // This makes it easier to style the tray with Tailwind classes.
  const state = open ? "open" : "closed" as const

  const contextValue = React.useMemo<TrayContextProps>(
    () => ({
      state,
      open,
      setOpen,
      toggle,
      isMobile,
    }),
    [state, open, setOpen, toggle, isMobile]
  )

  return (
    <TrayContext.Provider value={contextValue}>
      <div
        data-slot="tray-provider"
        data-tray="provider"
        data-state={state}
        className={cn(
          "transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open && !isMobile && "scale-[0.98] overflow-hidden rounded-2xl",
          open && isMobile && "-translate-x-full",
          className
        )}
        style={
          !isMobile
            ? { width: open ? `calc(100vw - ${TRAY_WIDTH})` : "100vw" }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    </TrayContext.Provider>
  )
}

function Tray({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const { open, isMobile } = useTray()

  const tray = (
    <div
      data-slot="tray"
      data-tray="root"
      data-state={open ? "open" : "closed"}
      style={
        {
          "--tray-width": TRAY_WIDTH,
          transform: open ? "translateX(0)" : "translateX(100%)",
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        "fixed inset-y-0 right-0 z-30 flex flex-col text-sm transition-transform duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isMobile
          ? "w-full bg-background"
          : "inset-y-2 right-2 w-(--tray-width) rounded-3xl bg-transparent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )

  if (typeof document === "undefined") return null
  return createPortal(tray, document.body)
}

function TrayTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggle } = useTray()

  return (
    <Button
      data-slot="tray-trigger"
      data-tray="trigger"
      size="sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggle()
      }}
      {...props}
    />
  )
}

function TrayHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const { isMobile, setOpen } = useTray()

  return (
    <div
      data-slot="tray-header"
      data-tray="header"
      className={cn(
        "flex items-center p-2",
        isMobile && "border-b",
        className
      )}
      {...props}
    >
      {isMobile && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
          >
            <ArrowBendUpLeftIcon className="size-4" />
          </Button>
          <div className="mx-1 h-4 w-px shrink-0 bg-foreground/10" />
        </>
      )}
      <span className="flex-1">{children}</span>
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen(false)}
        >
          <XIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}

function TrayClose({ className, variant = "ghost", ...props }: React.ComponentProps<typeof Button>) {
  const { setOpen } = useTray()

  return (
    <Button
      data-slot="tray-close"
      data-tray="close"
      variant={variant}
      size="icon-sm"
      className={cn(className)}
      onClick={() => setOpen(false)}
      {...props}
    >
      {props.children ?? <XIcon/>}
    </Button>
  )
}

function TrayContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tray-content"
      data-tray="content"
      className={cn("flex-1 overflow-y-auto px-2 pb-2", className)}
      {...props}
    />
  )
}

function TrayFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tray-footer"
      data-tray="footer"
      className={cn("flex items-center gap-2 border-t px-4 py-3", className)}
      {...props}
    />
  )
}

function TrayToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tray-toolbar"
      data-tray="toolbar"
      className={cn("flex items-center justify-between gap-2 py-2.5", className)}
      {...props}
    />
  )
}

function TraySeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="tray-separator"
      data-tray="separator"
      className={cn("w-auto", className)}
      {...props}
    />
  )
}

export {
  Tray,
  TrayContent,
  TrayFooter,
  TrayHeader,
  TrayProvider,
  TraySeparator,
  TrayToolbar,
  TrayTrigger,
  useTray,
}
