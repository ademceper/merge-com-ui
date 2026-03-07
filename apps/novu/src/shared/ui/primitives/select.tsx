import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import type * as React from "react";

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	
	
	
	SelectTrigger,
	SelectValue,
} from "@merge-rd/ui/components/select";

const selectTriggerVariants = cva(
	"data-placeholder:text-muted-foreground gap-1.5 rounded-lg border-0 bg-muted py-1 pr-2 pl-2.5 text-sm transition-colors select-none w-full text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:bg-input/30 flex items-center justify-between whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			size: {
				sm: "h-8 min-h-8 text-xs",
				md: "h-9 min-h-9 text-sm",
				default: "h-12 min-h-12 text-sm",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export function SelectIcon({
	asChild,
	children,
	...props
}: React.ComponentProps<typeof SelectPrimitive.Icon>) {
	return (
		<SelectPrimitive.Icon asChild={asChild} {...props}>
			{children}
		</SelectPrimitive.Icon>
	);
}
