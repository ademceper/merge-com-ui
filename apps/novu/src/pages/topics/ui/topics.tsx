import { useEffect } from "react";
import { AnimatedOutlet } from "@/shared/ui/animated-outlet";
import { PageMeta } from "@/shared/ui/page-meta";
import { useSetPageHeader } from "@/app/context/page-header";
import { TopicList } from "@/pages/topics/ui/topic-list";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export const TopicsPage = () => {
	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">Topics</h1>,
	);
	const track = useTelemetry();

	useEffect(() => {
		track(TelemetryEvent.TOPICS_PAGE_VISIT);
	}, [track]);

	return (
		<>
			<PageMeta title="Topics" />
			<TopicList />
			<AnimatedOutlet />
		</>
	);
};
