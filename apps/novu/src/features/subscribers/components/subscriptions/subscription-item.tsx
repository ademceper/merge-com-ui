import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@merge-rd/ui/components/dropdown-menu";
import { cn } from "@merge-rd/ui/lib/utils";
import { FeatureFlagsKeysEnum, PermissionsEnum } from "@novu/shared";
import {
	ChatTeardropDots,
	DotsThree,
	Pulse,
	Trash,
	TreeStructure,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import type { TopicSubscription } from "@/api/topics";
import { CompactButton } from "@/components/primitives/button-compact";
import { TimeDisplayHoverCard } from "@/components/time-display-hover-card";
import TruncatedText from "@/components/truncated-text";
import { useEnvironment } from "@/context/environment/hooks";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Protect } from "@/utils/protect";
import { buildRoute, ROUTES } from "@/utils/routes";

type SubscriptionItemProps = {
	subscription: TopicSubscription;
	onDeleteSubscription: (subscription: TopicSubscription) => void;
	onViewTopic: (subscription: TopicSubscription) => void;
	onViewSubscriptionPreferences: (subscription: TopicSubscription) => void;
};

export function SubscriptionItem({
	subscription,
	onDeleteSubscription,
	onViewTopic,
	onViewSubscriptionPreferences,
}: SubscriptionItemProps) {
	const { currentEnvironment } = useEnvironment();
	const isSubscriptionPreferencesEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_SUBSCRIPTION_PREFERENCES_ENABLED,
	);

	const stopPropagation = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{
				duration: 0.2,
				ease: [0.4, 0, 0.2, 1],
			}}
			className={cn(
				"border-bg-soft flex flex-row items-center justify-between gap-2 border-b px-4 py-3 transition-colors hover:bg-slate-50",
			)}
		>
			<div className="flex flex-1 flex-row items-center gap-2 overflow-hidden">
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="text-foreground-900 text-label-xs font-medium">
						<TruncatedText>
							{subscription.topic.name || subscription.topic.key}
						</TruncatedText>
					</div>
					<div className="text-text-soft text-label-2xs font-code">
						<TruncatedText>{subscription.topic.key}</TruncatedText>
					</div>
				</div>
			</div>
			{subscription.createdAt && (
				<TimeDisplayHoverCard
					date={subscription.createdAt}
					className="text-label-xs text-text-soft"
				>
					{format(new Date(subscription.createdAt), "MMM d, yyyy")}
				</TimeDisplayHoverCard>
			)}
			{isSubscriptionPreferencesEnabled && (
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<CompactButton
							icon={DotsThree}
							variant="ghost"
							className="z-10 h-8 w-8 p-0"
						/>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64" onClick={stopPropagation}>
						<DropdownMenuGroup>
							<Protect permission={PermissionsEnum.TOPIC_READ}>
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={() => onViewTopic(subscription)}
								>
									<ChatTeardropDots />
									View Topic
								</DropdownMenuItem>
							</Protect>
							<Protect permission={PermissionsEnum.TOPIC_READ}>
								<DropdownMenuItem
									className="cursor-pointer"
									onClick={() => onViewSubscriptionPreferences(subscription)}
								>
									<TreeStructure />
									View subscription preferences
								</DropdownMenuItem>
							</Protect>
							<Protect permission={PermissionsEnum.TOPIC_READ}>
								<DropdownMenuItem asChild className="cursor-pointer">
									<Link
										to={
											// TODO: update when we have a proper activity feed for subscriptions
											buildRoute(ROUTES.ACTIVITY_FEED, {
												environmentSlug: currentEnvironment?.slug ?? "",
											}) +
											"?" +
											new URLSearchParams({
												subscriberId: subscription.subscriber.subscriberId,
											}).toString()
										}
									>
										<Pulse weight="fill" />
										View subscription activity
									</Link>
								</DropdownMenuItem>
							</Protect>
							<Protect permission={PermissionsEnum.SUBSCRIBER_WRITE}>
								<DropdownMenuItem
									className="text-destructive cursor-pointer"
									onClick={() => onDeleteSubscription(subscription)}
								>
									<Trash />
									Remove subscription
								</DropdownMenuItem>
							</Protect>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</motion.div>
	);
}
