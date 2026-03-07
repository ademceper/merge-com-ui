import { cn } from "@merge-rd/ui/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";

export {
	ButtonGroup,
	ButtonGroup as ButtonGroupRoot,
	ButtonGroupSeparator,
	ButtonGroupText,
	buttonGroupVariants,
} from "@merge-rd/ui/components/button-group";

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
