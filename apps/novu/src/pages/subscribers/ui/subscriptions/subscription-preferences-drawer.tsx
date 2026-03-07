import { cn } from "@merge-rd/ui/lib/utils";
import { forwardRef, useRef } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/shared/ui/primitives/sheet";
import { VisuallyHidden } from "@/shared/ui/primitives/visually-hidden";
import { useGetSubscription } from "@/pages/subscribers/lib/use-get-subscription";
import { SubscriptionPreferences } from "./subscription-preferences";

type SubscriptionPreferencesDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	topicKey?: string;
	subscriptionId?: string;
	subscriberId?: string;
	className?: string;
};

export const SubscriptionPreferencesDrawer = forwardRef<
	HTMLDivElement,
	SubscriptionPreferencesDrawerProps
>(
	(
		{ open, onOpenChange, topicKey, subscriptionId, subscriberId, className },
		forwardedRef,
	) => {
		const overlayRef = useRef<HTMLDivElement>(null);

		const handleInteractOutside = (e: Event) => {
			const target = e.target as Node;
			if (overlayRef.current?.contains(target)) {
				onOpenChange(false);
			} else {
				e.preventDefault();
			}
		};

		const { data: subscription, isLoading } = useGetSubscription({
			topicKey,
			subscriptionId,
			options: { enabled: open },
		});

		return (
			<Sheet open={open} modal={false} onOpenChange={onOpenChange}>
				{/* Custom overlay since SheetOverlay does not work with modal={false} */}
				<div
					ref={overlayRef}
					className={cn(
						"fade-in animate-in fixed inset-0 z-50 bg-black/20 transition-opacity duration-300",
						{
							"pointer-events-none opacity-0": !open,
						},
					)}
				/>
				<SheetContent
					ref={forwardedRef}
					className={cn("w-[580px]", className)}
					onInteractOutside={handleInteractOutside}
				>
					<VisuallyHidden>
						<SheetTitle />
						<SheetDescription />
					</VisuallyHidden>
					<SubscriptionPreferences
						isLoading={isLoading}
						topicKey={topicKey}
						subscription={subscription}
						subscriberId={subscriberId}
					/>
				</SheetContent>
			</Sheet>
		);
	},
);
