import { cn } from "@merge-rd/ui/lib/utils";
import { forwardRef, useRef } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/shared/ui/primitives/sheet";
import { VisuallyHidden } from "@/shared/ui/primitives/visually-hidden";
import { useCombinedRefs } from "@/shared/lib/hooks/use-combined-refs";
import { useFormProtection } from "@/shared/lib/hooks/use-form-protection";

type ProtectedDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: React.ReactNode;
};

export const ProtectedDrawer = forwardRef<HTMLDivElement, ProtectedDrawerProps>(
	({ open, onOpenChange, children }, forwardedRef) => {
		const overlayRef = useRef<HTMLDivElement>(null);

		const { ref, protectedOnValueChange, ProtectionAlert } = useFormProtection({
			onValueChange: onOpenChange,
		});

		const combinedRef = useCombinedRefs(forwardedRef, ref);

		return (
			<>
				<Sheet open={open} modal={false} onOpenChange={protectedOnValueChange}>
					<div
						ref={overlayRef}
						className={cn(
							"fade-in animate-in fixed inset-0 z-50 bg-black/20 transition-opacity duration-300",
							{
								"pointer-events-none opacity-0": !open,
							},
						)}
					/>
					<SheetContent ref={combinedRef}>
						<VisuallyHidden>
							<SheetTitle />
							<SheetDescription />
						</VisuallyHidden>
						{children}
					</SheetContent>
				</Sheet>
				{ProtectionAlert}
			</>
		);
	},
);
