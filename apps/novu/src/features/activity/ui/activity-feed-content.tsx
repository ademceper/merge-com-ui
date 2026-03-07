import {
	ResizablePanel,
	ResizablePanelGroup,
} from "@merge-rd/ui/components/resizable";
import { cn } from "@merge-rd/ui/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UpdatedAgo } from "@/shared/ui/updated-ago";
import { useEnvironment } from "@/app/context/environment/hooks";
import { ActivityError } from "@/features/activity/ui/activity-error";
import { ActivityFilters } from "@/features/activity/ui/activity-filters";
import { ActivityHeader } from "@/features/activity/ui/activity-header";
import { ActivityLogs } from "@/features/activity/ui/activity-logs";
import { ActivityOverview } from "@/features/activity/ui/activity-overview";
import { ActivityPanel } from "@/features/activity/ui/activity-panel";
import { ActivitySkeleton } from "@/features/activity/ui/activity-skeleton";
import { ActivityTable } from "@/features/activity/ui/activity-table";
import { defaultActivityFilters } from "@/features/activity/ui/constants";
import { useActivityUrlState } from "@/features/activity/lib/use-activity-url-state";
import { usePullActivity } from "@/features/activity/lib/use-pull-activity";
import { EmptyTopicsIllustration } from "@/features/topics/ui/empty-topics-illustration";
import type { ActivityFiltersData } from "@/shared/model/activity";
import { QueryKeys } from "@/shared/lib/query-keys";

type ActivityFeedContentProps = {
	initialFilters?: Partial<ActivityFiltersData>;
	hideFilters?: Array<
		| "dateRange"
		| "workflows"
		| "channels"
		| "transactionId"
		| "subscriberId"
		| "topicKey"
	>;
	className?: string;
	contentHeight?: string;
	onTriggerWorkflow?: () => void;
};

export function ActivityFeedContent({
	initialFilters = {},
	hideFilters = [],
	className,
	contentHeight = "h-[calc(100vh-140px)]",
	onTriggerWorkflow,
}: ActivityFeedContentProps) {
	const {
		activityItemId,
		filters,
		filterValues,
		handleActivitySelect,
		handleFiltersChange,
	} = useActivityUrlState();
	const { activity, isPending, error } = usePullActivity(activityItemId);

	const queryClient = useQueryClient();
	const { currentEnvironment } = useEnvironment();

	// Track last updated time for the activities list
	const [lastUpdated, setLastUpdated] = useState(new Date());

	useEffect(() => {
		setLastUpdated(new Date());
	}, []);

	// Merge initial filters with current filters
	const mergedFilterValues = useMemo(
		() => ({
			...defaultActivityFilters,
			...initialFilters,
			...filterValues,
		}),
		[initialFilters, filterValues],
	);

	const mergedFilters = useMemo(
		() => ({
			...filters,
			// Apply initial filters that should always be present
			...(initialFilters.workflows?.length && {
				workflows: initialFilters.workflows,
			}),
			...(initialFilters.subscriberId && {
				subscriberId: initialFilters.subscriberId,
			}),
			...(initialFilters.topicKey && { topicKey: initialFilters.topicKey }),
		}),
		[filters, initialFilters],
	);

	const hasActiveFilters = Object.entries(mergedFilters).some(
		([key, value]) => {
			// Ignore dateRange as it's always present
			if (key === "dateRange") return false;

			// Ignore initial filters that are always applied
			if (key === "workflows" && initialFilters.workflows?.length) {
				return (
					Array.isArray(value) &&
					value.length > (initialFilters.workflows?.length || 0)
				);
			}

			if (key === "subscriberId" && initialFilters.subscriberId) {
				return value !== initialFilters.subscriberId;
			}

			if (key === "topicKey" && initialFilters.topicKey) {
				return value !== initialFilters.topicKey;
			}

			// For arrays, check if they have any items
			if (Array.isArray(value)) return value.length > 0;

			// For other values, check if they exist
			return !!value;
		},
	);

	const handleClearFilters = () => {
		handleFiltersChange({
			...defaultActivityFilters,
			...initialFilters,
		});
	};

	const hasChanges = useMemo(() => {
		const baseFilters = { ...defaultActivityFilters, ...initialFilters };
		return (
			mergedFilterValues.dateRange !== baseFilters.dateRange ||
			mergedFilterValues.channels.length > 0 ||
			mergedFilterValues.workflows.length >
				(baseFilters.workflows?.length || 0) ||
			mergedFilterValues.transactionId !== (baseFilters.transactionId || "") ||
			mergedFilterValues.subscriberId !== (baseFilters.subscriberId || "") ||
			mergedFilterValues.severity.length > 0
		);
	}, [mergedFilterValues, initialFilters]);

	const handleTransactionIdChange = useCallback(
		(newTransactionId: string, activityId?: string) => {
			if (activityId) {
				handleActivitySelect(activityId);
			} else {
				handleFiltersChange({
					...mergedFilterValues,
					...(newTransactionId && { transactionId: newTransactionId }),
				});
			}
		},
		[mergedFilterValues, handleFiltersChange, handleActivitySelect],
	);

	const handleRefresh = async () => {
		await queryClient.invalidateQueries({
			queryKey: [QueryKeys.fetchActivities, currentEnvironment?._id],
		});
		setLastUpdated(new Date());
	};

	return (
		<div className={cn("p-2.5", className)}>
			<div className="flex items-center justify-between pb-2.5 gap-2">
				<ActivityFilters
					filters={mergedFilterValues}
					onFiltersChange={handleFiltersChange}
					onReset={handleClearFilters}
					showReset={hasChanges}
					hide={hideFilters}
					className="pb-0"
				/>
				<UpdatedAgo lastUpdated={lastUpdated} onRefresh={handleRefresh} />
			</div>
			<div className={`relative flex ${contentHeight}`}>
				<ResizablePanelGroup direction="horizontal" className="gap-2">
					<ResizablePanel defaultSize={50} minSize={35} className="h-full ">
						<ActivityTable
							selectedActivityId={activityItemId}
							onActivitySelect={handleActivitySelect}
							filters={mergedFilters}
							hasActiveFilters={hasActiveFilters}
							onClearFilters={handleClearFilters}
							onTriggerWorkflow={onTriggerWorkflow}
						/>
					</ResizablePanel>

					<ResizablePanel defaultSize={50} minSize={35} maxSize={50}>
						<AnimatePresence mode="wait">
							<motion.div
								key={activityItemId}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{
									duration: 0.2,
								}}
								className="border-stroke-soft h-full overflow-auto rounded-lg border bg-white"
							>
								{activityItemId ? (
									<ActivityPanel>
										{isPending ? (
											<ActivitySkeleton />
										) : error || !activity ? (
											<ActivityError />
										) : (
											<>
												<ActivityHeader
													activity={activity}
													onTransactionIdChange={handleTransactionIdChange}
												/>
												<ActivityOverview activity={activity} />
												<ActivityLogs
													activity={activity}
													onActivitySelect={handleActivitySelect}
												/>
											</>
										)}
									</ActivityPanel>
								) : (
									<div className="flex h-full w-full flex-col items-center justify-center gap-6 text-center">
										<EmptyTopicsIllustration />
										<p className="text-text-soft text-paragraph-sm max-w-[60ch]">
											Nothing to show,
											<br />
											Select an log on the left to view detailed info here
										</p>
									</div>
								)}
							</motion.div>
						</AnimatePresence>
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	);
}
