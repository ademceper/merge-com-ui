import { Badge } from "@/shared/ui/primitives/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { formatCount, formatCountForTooltip } from "@/shared/lib/format-count";

type SubscriptionCountBadgeProps = {
	count: number;
	isCapped: boolean;
};

export function SubscriptionCountBadge({
	count,
	isCapped,
}: SubscriptionCountBadgeProps) {
	const displayCount = formatCount(count);
	const tooltipText = formatCountForTooltip(count, isCapped);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Badge size="sm" variant="lighter" color="gray" className="ml-2">
					{displayCount}
				</Badge>
			</TooltipTrigger>
			<TooltipContent>
				<span>{tooltipText} subscriptions</span>
			</TooltipContent>
		</Tooltip>
	);
}
