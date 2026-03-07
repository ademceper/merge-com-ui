import type { GetSubscriberPreferencesDto } from "@novu/api/models/components";
import { type ChannelTypeEnum, FeatureFlagsKeysEnum } from "@/shared";
import { Question, SpinnerGap } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
	showErrorToast,
	showSuccessToast,
} from "@/shared/ui/primitives/sonner-helpers";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { SidebarContent } from "@/widgets/side-navigation/sidebar";
import { ContextFilter } from "@/features/contexts/ui/context-filter";
import { PreferencesItem } from "@/features/subscribers/ui/preferences/preferences-item";
import { WorkflowPreferences } from "@/features/subscribers/ui/preferences/workflow-preferences";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";
import { useOptimisticChannelPreferences } from "@/shared/lib/hooks/use-optimistic-channel-preferences";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { itemVariants, sectionVariants } from "@/shared/lib/animation";
import { TelemetryEvent } from "@/shared/lib/telemetry";
import { PreferencesBlank } from "./preferences-blank";
import { SubscribersSchedule } from "./subscribers-schedule";

type PreferencesProps = {
	subscriberPreferences: GetSubscriberPreferencesDto;
	subscriberId: string;
	readOnly?: boolean;
	contextKeys?: string[];
	onContextChange?: (contextKeys: string[] | undefined) => void;
};

export const Preferences = (props: PreferencesProps) => {
	const {
		subscriberPreferences,
		subscriberId,
		readOnly = false,
		contextKeys,
		onContextChange,
	} = props;
	const track = useTelemetry();

	const { updateChannelPreferences, isPending } =
		useOptimisticChannelPreferences({
			subscriberId,
			contextKeys,
			onSuccess: () => {
				showSuccessToast("Subscriber preferences updated successfully");
				track(TelemetryEvent.SUBSCRIBER_PREFERENCES_UPDATED);
			},
			onError: () => {
				showErrorToast("Failed to update preferences. Please try again.");
			},
		});

	const isSubscribersScheduleEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_SUBSCRIBERS_SCHEDULE_ENABLED,
	);
	const isContextPreferencesEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_CONTEXT_PREFERENCES_ENABLED,
	);

	const { workflows, globalChannelsKeys, hasZeroPreferences } = useMemo(() => {
		const global = subscriberPreferences?.global ?? { channels: {} };
		const workflows = subscriberPreferences?.workflows ?? [];
		const globalChannelsKeys = Object.entries(global?.channels ?? {}) as [
			ChannelTypeEnum,
			boolean,
		][];

		const hasZeroPreferences =
			workflows.length === 0 && globalChannelsKeys.length === 0;

		return { global, workflows, globalChannelsKeys, hasZeroPreferences };
	}, [subscriberPreferences]);

	if (hasZeroPreferences) {
		return <PreferencesBlank />;
	}

	return (
		<motion.div
			className="flex h-full flex-col items-stretch"
			initial="hidden"
			animate="visible"
			variants={{ ...sectionVariants }}
		>
			{onContextChange && isContextPreferencesEnabled && (
				<motion.div variants={itemVariants}>
					<SidebarContent
						size="md"
						className="min-h-max overflow-x-auto py-2 px-2"
					>
						<div className="flex items-center gap-2">
							<ContextFilter
								contextKeys={contextKeys || [""]}
								onContextKeysChange={(keys) => onContextChange?.(keys)}
								defaultOnClear={true}
							/>
						</div>
					</SidebarContent>
				</motion.div>
			)}

			<motion.div variants={itemVariants}>
				<div className="flex items-center gap-2 bg-neutral-50 px-4 py-2">
					<span className="text-2xs line-height uppercase text-neutral-400">
						Global preferences
					</span>
					<Tooltip>
						<TooltipTrigger className="cursor-pointer">
							<Question className="size-3 text-neutral-400" />
						</TooltipTrigger>
						<TooltipContent side="right" className="max-w-sm">
							<p>
								Subscribers can set global channel preferences, which override
								individual settings, e.g., disable SMS for all workflows at
								once.
							</p>
						</TooltipContent>
					</Tooltip>
					{isPending && (
						<SpinnerGap className="size-3 animate-spin text-neutral-400" />
					)}
				</div>

				<SidebarContent size="md">
					{globalChannelsKeys.map(([channel, enabled]) => (
						<PreferencesItem
							key={channel}
							channel={channel}
							readOnly={readOnly}
							enabled={enabled}
							onChange={(checked: boolean) =>
								updateChannelPreferences({ [channel]: checked })
							}
						/>
					))}
				</SidebarContent>
			</motion.div>

			{isSubscribersScheduleEnabled && (
				<>
					<motion.div variants={itemVariants}>
						<SidebarContent size="md" className="pb-0">
							<div className="w-full border-t border-neutral-100" />
						</SidebarContent>
					</motion.div>
					<motion.div variants={itemVariants}>
						<SidebarContent size="md">
							<SubscribersSchedule
								globalPreference={subscriberPreferences.global}
								subscriberId={subscriberId}
								contextKeys={contextKeys}
							/>
						</SidebarContent>
					</motion.div>
				</>
			)}

			<motion.div variants={itemVariants}>
				<div className="flex items-center gap-2 bg-neutral-50 px-4 py-2">
					<span className="text-2xs line-height uppercase text-neutral-400">
						Workflow Preferences
					</span>
					<Tooltip>
						<TooltipTrigger className="cursor-pointer">
							<Question className="size-3 text-neutral-400" />
						</TooltipTrigger>
						<TooltipContent side="right" className="max-w-sm">
							<p>
								This section displays all workflows and their preferences for
								the subscriber. The list may be further filtered using workflow
								tags or preference filters.
							</p>
						</TooltipContent>
					</Tooltip>
					{isPending && (
						<SpinnerGap className="size-3 animate-spin text-neutral-400" />
					)}
				</div>

				<SidebarContent size="md">
					{workflows.map((wf) => (
						<WorkflowPreferences
							key={wf.workflow.slug}
							workflowPreferences={wf}
							onToggle={updateChannelPreferences}
							readOnly={readOnly}
						/>
					))}
				</SidebarContent>
			</motion.div>
		</motion.div>
	);
};
