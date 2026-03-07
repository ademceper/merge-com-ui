import { cn } from "@merge-rd/ui/lib/utils";
import { Question } from "@phosphor-icons/react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/shared/ui/primitives/tooltip";

interface HelpTooltipIndicatorProps {
	text: React.ReactNode;
	className?: string;
	size?: "3" | "4" | "5";
}

export function HelpTooltipIndicator({
	text,
	className,
	size = "4",
}: HelpTooltipIndicatorProps) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<span
					className={cn(
						"text-foreground-400 hover:cursor inline-block",
						`size-${size}`,
						className,
					)}
				>
					<Question className={`size-${size}`} />
				</span>
			</TooltipTrigger>
			<TooltipContent className="max-w-xs whitespace-pre-line">
				{text}
			</TooltipContent>
		</Tooltip>
	);
}
