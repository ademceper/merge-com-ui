import { cn } from "@merge-rd/ui/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import React, { forwardRef } from "react";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "@/components/primitives/sheet";
import { ActivityError } from "@/features/activity/components/activity-error";
import { ActivityHeader } from "@/features/activity/components/activity-header";
import { ActivityLogs } from "@/features/activity/components/activity-logs";
import { ActivityOverview } from "@/features/activity/components/activity-overview";
import { ActivityPanel } from "@/features/activity/components/activity-panel";
import { ActivitySkeleton } from "@/features/activity/components/activity-skeleton";
import { usePullActivity } from "@/features/activity/hooks/use-pull-activity";

type ActivityPanelDrawerProps = {
	onActivitySelect: (activityId: string) => void;
	activityId: string;
};

export const ActivityDetailsDrawer = forwardRef<
	HTMLDivElement,
	ActivityPanelDrawerProps
>((props, ref) => {
	const { activityId, onActivitySelect } = props;
	const isOpen = !!activityId;
	const { activity, isPending, error } = usePullActivity(activityId);

	function handleTransactionIdChange(
		_newTransactionId: string,
		activityId: string,
	) {
		onActivitySelect(activityId);
	}

	return (
		<Sheet
			modal={false}
			open={isOpen}
			onOpenChange={(isOpen) => {
				if (!isOpen) {
					onActivitySelect("");
				}
			}}
		>
			<div
				className={cn(
					"fade-in animate-in fixed inset-0 z-50 bg-black/20 transition-opacity duration-300",
					{
						"pointer-events-none opacity-0": !isOpen,
					},
				)}
			/>
			<SheetContent
				ref={ref}
				className={
					// to make the drawers stacking effect, we need to make sure the width is a bit smaller than the normal sidebar width
					'w-3/4 sm:max-w-[540px] **:data-[close-button="true"]:hidden'
				}
			>
				<VisuallyHidden>
					<SheetTitle />
					<SheetDescription />
				</VisuallyHidden>
				<ActivityPanel>
					{isPending ? (
						<ActivitySkeleton headerClassName="h-12" />
					) : error || !activity ? (
						<ActivityError />
					) : (
						<React.Fragment key={activityId}>
							<ActivityHeader
								className="h-12 py-3"
								activity={activity}
								onTransactionIdChange={handleTransactionIdChange}
								onClose={() => onActivitySelect("")}
							/>
							<ActivityOverview activity={activity} />
							<ActivityLogs
								activity={activity}
								onActivitySelect={onActivitySelect}
							/>
						</React.Fragment>
					)}
				</ActivityPanel>
			</SheetContent>
		</Sheet>
	);
});
