import { cn } from "@merge-rd/ui/lib/utils";
import type { HTMLAttributes } from "react";

type TabsSectionProps = HTMLAttributes<HTMLDivElement>;

export const TabsSection = (props: TabsSectionProps) => {
	const { className, ...rest } = props;
	return (
		<div className={cn("flex flex-col gap-3 px-3 py-5", className)} {...rest} />
	);
};
