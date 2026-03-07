import { Link } from "@tanstack/react-router";
import { Badge } from "@/shared/ui/primitives/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipPortal,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";
import { ROUTES } from "@/shared/lib/routes";

export function AnalyticsUpgradeCtaIcon() {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link
					to={`${ROUTES.SETTINGS_BILLING}?utm_source=analytics-date-filter`}
					className="block flex items-center justify-center transition-all duration-200 hover:scale-105"
				>
					<Badge color="purple" size="sm" variant="lighter">
						Upgrade
					</Badge>
				</Link>
			</TooltipTrigger>
			<TooltipPortal>
				<TooltipContent>
					Upgrade your plan to unlock extended retention periods
				</TooltipContent>
			</TooltipPortal>
		</Tooltip>
	);
}
