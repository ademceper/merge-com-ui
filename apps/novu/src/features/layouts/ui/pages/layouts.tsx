import { useEffect } from "react";

import { AnimatedOutlet } from "@/shared/ui/animated-outlet";
import { PageMeta } from "@/shared/ui/page-meta";
import { useSetPageHeader } from "@/app/context/page-header";
import { LayoutList } from "@/features/layouts/ui/layout-list";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { TelemetryEvent } from "@/shared/lib/telemetry";

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
