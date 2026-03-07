import { cn } from "@merge-rd/ui/lib/utils";

export type { ChartConfig } from "@merge-rd/ui/components/chart";
export {
	ChartContainer,
	
	
	
	ChartTooltip,
	
} from "@merge-rd/ui/components/chart";

/**
 * NovuTooltip is a custom chart tooltip component for Novu analytics charts.
 */
export function NovuTooltip({
	active,
	payload,
	showTotal = true,
	className,
}: {
	active?: boolean;
	payload?: Array<{
		name?: string;
		value?: number;
		color?: string;
		dataKey?: string;
		payload?: Record<string, unknown>;
	}>;
	showTotal?: boolean;
	className?: string;
}) {
	if (!active || !payload?.length) {
		return null;
	}

	const total = payload.reduce((sum, entry) => sum + (entry.value ?? 0), 0);

	return (
		<div
			className={cn(
				"border-border/50 bg-background rounded-lg border px-3 py-2 text-xs shadow-xl",
				className,
			)}
		>
			<div className="grid gap-1">
				{payload.map((entry, index) => (
					<div key={index} className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-1.5">
							<div
								className="size-2 shrink-0 rounded-full"
								style={{ backgroundColor: entry.color }}
							/>
							<span className="text-muted-foreground">{entry.name}</span>
						</div>
						<span className="font-mono font-medium tabular-nums">
							{entry.value?.toLocaleString()}
						</span>
					</div>
				))}
				{showTotal && payload.length > 1 && (
					<>
						<div className="my-0.5 h-px bg-border" />
						<div className="flex items-center justify-between gap-4">
							<span className="text-muted-foreground font-medium">Total</span>
							<span className="font-mono font-medium tabular-nums">
								{total.toLocaleString()}
							</span>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
