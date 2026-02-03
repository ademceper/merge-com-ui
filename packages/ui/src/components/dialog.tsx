"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@merge/ui/lib/utils"
import { Button } from "@merge/ui/components/button"
import { XIcon } from "@phosphor-icons/react"
import { useIsMobile } from "@merge/ui/hooks/use-mobile"
import {
  Drawer as DrawerPrimitive,
  DrawerClose as DrawerClosePrimitive,
  DrawerContent as DrawerContentBase,
  DrawerDescription as DrawerDescriptionBase,
  DrawerFooter as DrawerFooterBase,
  DrawerHeader as DrawerHeaderBase,
  DrawerTitle as DrawerTitleBase,
  DrawerTrigger as DrawerTriggerPrimitive,
} from "@merge/ui/components/drawer"
import { Separator } from "@merge/ui/components/separator"

export function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return <DrawerPrimitive data-slot="dialog" {...props} />
  }
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

export function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return <DrawerTriggerPrimitive data-slot="dialog-trigger" {...props} />
  }
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

export function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

export function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return <DrawerClosePrimitive data-slot="dialog-close" {...props} />
  }
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

export function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50", className)}
      {...props}
    />
  )
}

export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <DrawerContentBase
        data-slot="dialog-content"
        className={cn("gap-4 px-4 pt-4 pb-0", className)}
        {...props}
      >
        {children}
      </DrawerContentBase>
    )
  }
  const childArray = React.Children.toArray(children)
  const hasHeader = childArray.length >= 2
  const hasFooter = childArray.length >= 3
  const headerChild = hasHeader ? childArray[0] : null
  const footerChild = hasFooter ? childArray[childArray.length - 1] : null
  const contentChildren =
    childArray.length === 1
      ? childArray
      : childArray.length === 2
        ? childArray.slice(1)
        : childArray.slice(1, -1)

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 flex min-h-0 max-h-[90vh] max-w-[calc(100%-2rem)] flex-col overflow-hidden rounded-xl text-sm ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
          className
        )}
        {...props}
      >
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button variant="ghost" className="absolute top-2 right-2 z-10" size="icon-sm">
              <XIcon />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
        {headerChild != null && <div className="shrink-0 px-4 pt-4">{headerChild}</div>}
        <div className="min-h-0 flex-auto overflow-y-auto overflow-x-hidden px-4 pt-4 pb-4">
          {contentChildren}
        </div>
        {footerChild != null && (
          <div className="shrink-0 border-t bg-background">{footerChild}</div>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <DrawerHeaderBase
        data-slot="dialog-header"
        className={cn("gap-2 flex flex-col", className)}
        {...props}
      />
    )
  }
  return (
    <div
      data-slot="dialog-header"
      className={cn("gap-2 flex flex-col", className)}
      {...props}
    >
      {props.children}
      <Separator />
    </div>
  )
}

export function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <DrawerFooterBase
        data-slot="dialog-footer"
        className={cn(
          "bg-muted/50 rounded-b-xl border-t -mx-4 px-4 pt-3 pb-3 flex flex-row justify-end gap-2",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DrawerClosePrimitive asChild>
            <Button variant="outline">Close</Button>
          </DrawerClosePrimitive>
        )}
      </DrawerFooterBase>
    )
  }
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "bg-muted/50 rounded-b-xl border-t px-4 pt-3 pb-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <DrawerTitleBase
        data-slot="dialog-title"
        className={cn("text-base leading-none font-medium", className)}
        {...props}
      />
    )
  }
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-base leading-none font-medium", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  const isMobile = useIsMobile()
  if (isMobile) {
    return (
      <DrawerDescriptionBase
        data-slot="dialog-description"
        className={cn("text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3", className)}
        {...props}
      />
    )
  }
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3", className)}
      {...props}
    />
  )
}
