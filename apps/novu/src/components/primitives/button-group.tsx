import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@merge/ui/lib/utils";

export {
  ButtonGroup,
  ButtonGroupText,
  ButtonGroupSeparator,
  buttonGroupVariants,
} from "@merge/ui/components/button-group";

export { ButtonGroup as ButtonGroupRoot } from "@merge/ui/components/button-group";

export function ButtonGroupItem({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="button-group-item"
      className={cn("inline-flex", className)}
      {...props}
    />
  );
}
