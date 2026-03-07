import { useEffect } from "react";
import { AnimatedOutlet } from "@/shared/ui/animated-outlet";
import { PageMeta } from "@/shared/ui/page-meta";
import { Badge } from "@/shared/ui/primitives/badge";
import { useSetPageHeader } from "@/app/context/page-header";
import { ContextList } from "@/pages/contexts/ui";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export const ContextsPage = () => {
	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">
			Contexts{" "}
			<Badge color="gray" size="sm">
				BETA
			</Badge>
		</h1>,
	);
	const track = useTelemetry();

	useEffect(() => {
		track(TelemetryEvent.CONTEXTS_PAGE_VISIT);
	}, [track]);

	return (
		<>
			<PageMeta title="Contexts" />
			<ContextList />
			<AnimatedOutlet />
		</>
	);
};
