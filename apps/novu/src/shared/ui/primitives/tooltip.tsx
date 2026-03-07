import type * as React from "react";

export {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@merge-rd/ui/components/tooltip";

/**
 * TooltipPortal is a passthrough since merge/ui's TooltipContent already handles portaling.
 */
export function TooltipPortal({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

/**
 * TooltipArrow is a no-op since merge/ui's TooltipContent already includes an arrow.
 */
function TooltipArrow(_props: Record<string, unknown>) {
	return null;
}
