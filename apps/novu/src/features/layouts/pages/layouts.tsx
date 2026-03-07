import { useEffect } from "react";

import { AnimatedOutlet } from "@/components/animated-outlet";
import { PageMeta } from "@/components/page-meta";
import { useSetPageHeader } from "@/context/page-header";
import { LayoutList } from "@/features/layouts/components/layout-list";
import { useTelemetry } from "@/hooks/use-telemetry";
import { TelemetryEvent } from "@/utils/telemetry";

export const LayoutsPage = () => {
	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">
			Email Layouts
		</h1>,
	);
	const track = useTelemetry();

	useEffect(() => {
		track(TelemetryEvent.LAYOUTS_PAGE_VISIT);
	}, [track]);

	return (
		<>
			<PageMeta title="Email Layouts" />
			<LayoutList />
			<AnimatedOutlet />
		</>
	);
};
