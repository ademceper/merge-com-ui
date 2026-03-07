import type * as React from "react";

export {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@merge-rd/ui/components/hover-card";

/**
 * HoverCardPortal is a passthrough since merge/ui's HoverCardContent already handles portaling.
 */
export function HoverCardPortal({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}
