import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

export {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@merge/ui/components/popover";

export const DEFAULT_SIDE_OFFSET = 5;

/**
 * PopoverPortal is a passthrough since merge/ui's PopoverContent already handles portaling.
 */
export function PopoverPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function PopoverArrow({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return <PopoverPrimitive.Arrow className={className} {...props} />;
}

export function PopoverClose({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close {...props} />;
}
