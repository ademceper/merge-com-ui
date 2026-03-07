import {
	badgeVariants,
	Badge as MergeBadge,
} from "@merge-rd/ui/components/badge";
import type * as React from "react";

;

export type BadgeRootProps = React.ComponentProps<typeof MergeBadge>;

export function Badge({ children, ...props }: BadgeRootProps) {
	return <MergeBadge {...props}>{children}</MergeBadge>;
}

export function BadgeIcon({
	as: Icon,
	className,
	...props
}: {
	as: React.ComponentType<{ className?: string } & Record<string, unknown>>;
	className?: string;
} & Record<string, unknown>) {
	return <Icon data-icon="inline-start" className={className} {...props} />;
}
