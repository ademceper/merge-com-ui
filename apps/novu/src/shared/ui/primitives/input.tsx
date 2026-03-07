import { cn } from "@merge-rd/ui/lib/utils";
import type * as React from "react";

export { Input } from "@merge-rd/ui/components/input";

export type InputProps = React.ComponentProps<"input">;

export function InputRoot({
	className,
	hasError,
	size,
	children,
	...props
}: React.ComponentProps<"div"> & {
	hasError?: boolean;
	size?: "2xs" | "xs" | "sm" | "md" | "default";
}) {
	return (
		<div
			data-slot="input-root"
			data-error={hasError || undefined}
			data-size={size}
			className={cn(
				"flex items-center rounded-lg bg-muted dark:bg-input/30 transition-colors",
				"focus-within:ring-2 focus-within:ring-ring",
				hasError && "ring-2 ring-destructive/20",
				size === "2xs" && "h-7 text-xs",
				size === "xs" && "h-8 text-xs",
				size === "sm" && "h-9 text-sm",
				(!size || size === "md" || size === "default") && "h-12 text-sm",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export function InputWrapper({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="input-wrapper"
			className={cn("flex flex-1 items-center gap-2 px-2.5", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export function InputPure({
	className,
	...props
}: React.ComponentProps<"input">) {
	return (
		<input
			data-slot="input-pure"
			className={cn(
				"flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-0 w-full",
				"disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}
