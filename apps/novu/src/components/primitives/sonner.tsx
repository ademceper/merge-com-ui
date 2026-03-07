import { cn } from "@merge-rd/ui/lib/utils";
import {
	CheckCircle,
	Info,
	SpinnerGap,
	WarningCircle,
} from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

export const Toaster = (props: ToasterProps) => {
	return <SonnerToaster className="toaster group" {...props} />;
};

const toastIconVariants = cva("size-5 shrink-0", {
	variants: {
		variant: {
			default: "text-foreground-600",
			success: "text-success",
			error: "text-destructive",
			warning: "text-warning",
			info: "text-information",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

type ToastIconVariants = VariantProps<typeof toastIconVariants>;

const icons: Record<string, React.ElementType> = {
	default: SpinnerGap,
	success: CheckCircle,
	error: WarningCircle,
	warning: WarningCircle,
	info: Info,
};

export const ToastIcon = ({
	variant = "default",
	className,
}: ToastIconVariants & { className?: string }) => {
	const Icon = icons[variant ?? "default"] ?? SpinnerGap;
	return <Icon className={cn(toastIconVariants({ variant }), className)} />;
};

export type ToastProps = {
	variant?: "lg" | "default";
	title?: string;
	className?: string;
	children: ReactNode;
};

export const Toast = ({
	variant = "default",
	title,
	className,
	children,
}: ToastProps) => {
	return (
		<div
			className={cn(
				"bg-background text-foreground border-border flex items-center gap-2 rounded-lg border p-4 shadow-lg",
				variant === "lg" && "min-w-[356px]",
				className,
			)}
		>
			{title && <span className="text-sm font-medium">{title}</span>}
			{children}
		</div>
	);
};

export const ToastClose = ({ close }: { close: () => void }) => {
	return (
		<button
			onClick={close}
			className="text-foreground-400 hover:text-foreground ml-auto"
		>
			×
		</button>
	);
};
