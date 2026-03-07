import { useEffect } from "react";
import { AnimatedOutlet } from "@/components/animated-outlet";
import { PageMeta } from "@/components/page-meta";
import { useSetPageHeader } from "@/context/page-header";
import { TopicList } from "@/features/topics/components/topic-list";
import { useTelemetry } from "@/hooks/use-telemetry";
import { TelemetryEvent } from "@/utils/telemetry";

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
