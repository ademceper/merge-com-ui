import { cn } from "@merge-rd/ui/lib/utils";
import type * as React from "react";

export {
	Sheet,
	
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetPortal,
	SheetTitle,
} from "@merge-rd/ui/components/sheet";

/**
 * SheetMain provides a scrollable main content area inside a Sheet.
 */
export function SheetMain({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-main"
			className={cn("flex-1 overflow-y-auto p-4", className)}
			{...props}
		/>
	);
}

/**
 * SheetContentBase renders sheet content without the default overlay and portal.
 */
export function SheetContentBase({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-content-base"
			className={cn("flex flex-col gap-4", className)}
			{...props}
		>
			{children}
		</div>
	);
}
