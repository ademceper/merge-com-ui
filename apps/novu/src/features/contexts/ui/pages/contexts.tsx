import { useEffect } from "react";
import { AnimatedOutlet } from "@/components/animated-outlet";
import { PageMeta } from "@/components/page-meta";
import { Badge } from "@/components/primitives/badge";
import { useSetPageHeader } from "@/context/page-header";
import { ContextList } from "@/features/contexts/components";
import { useTelemetry } from "@/hooks/use-telemetry";
import { TelemetryEvent } from "@/utils/telemetry";

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
