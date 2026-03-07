import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@merge-rd/ui/components/tabs";
import { FeatureFlagsKeysEnum } from "@/shared";
import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { RequestsTable } from "@/widgets/http-logs/logs-table";
import { PageMeta } from "@/shared/ui/page-meta";
import { useEnvironment } from "@/app/context/environment/hooks";
import { useSetPageHeader } from "@/app/context/page-header";
import { ActivityFeedContent } from "@/pages/activity/ui/activity-feed-content";
import { useFeatureFlag } from "@/shared/lib/hooks/use-feature-flag";
import { useTelemetry } from "@/shared/lib/hooks/use-telemetry";
import { buildRoute, ROUTES } from "@/shared/lib/routes";
import { TelemetryEvent } from "@/shared/lib/telemetry";

export function ActivityFeed() {
	useSetPageHeader(
		<h1 className="text-foreground-950 flex items-center gap-1">
			Activity Feed
		</h1>,
	);
	const isHttpLogsPageEnabled = useFeatureFlag(
		FeatureFlagsKeysEnum.IS_HTTP_LOGS_PAGE_ENABLED,
		false,
	);
	const { currentEnvironment } = useEnvironment();
	const location = useLocation();
	const navigate = useNavigate();
	const track = useTelemetry();

	// Determine current tab based on URL
	const getCurrentTab = () => {
		if (location.pathname.includes("/activity/requests")) {
			return "requests";
		}

		if (location.pathname.includes("/activity/workflow-runs")) {
			return "workflow-runs";
		}

		// Default fallback for the original activity-feed route
		if (location.pathname.includes("/activity-feed")) {
			return "workflow-runs";
		}

		return "workflow-runs";
	};

	const currentTab = getCurrentTab();

	// Handle tab changes by navigating to the appropriate URL
	const handleTabChange = (value: string) => {
		if (!currentEnvironment?.slug) return;

		if (value === "requests") {
			navigate({
				to: buildRoute(ROUTES.ACTIVITY_REQUESTS, {
					environmentSlug: currentEnvironment.slug,
				}),
			});
		} else if (value === "workflow-runs") {
			navigate({
				to: buildRoute(ROUTES.ACTIVITY_WORKFLOW_RUNS, {
					environmentSlug: currentEnvironment.slug,
				}),
			});
		}
	};

	// Redirect legacy activity-feed URLs to the new runs URL when feature flag is enabled
	useEffect(() => {
		if (
			isHttpLogsPageEnabled &&
			location.pathname.includes("/activity-feed") &&
			currentEnvironment?.slug
		) {
			const newPath = buildRoute(ROUTES.ACTIVITY_WORKFLOW_RUNS, {
				environmentSlug: currentEnvironment.slug,
			});
			navigate({
				to: `${newPath}${location.searchStr}`,
				replace: true,
			});
		}
	}, [
		isHttpLogsPageEnabled,
		location.pathname,
		location.searchStr,
		currentEnvironment?.slug,
		navigate,
	]);

	// Track page visit for requests tab
	useEffect(() => {
		if (currentTab === "requests") {
			track(TelemetryEvent.REQUEST_LOGS_PAGE_VISIT);
		}
	}, [currentTab, track]);

	return (
		<>
			<PageMeta title="Activity Feed" />
			<Tabs
				value={currentTab}
				onValueChange={handleTabChange}
				className="-mx-2"
			>
				<TabsList variant="regular" className="border-t-0">
					<TabsTrigger value="workflow-runs" variant="regular" size="lg">
						Workflow Runs
					</TabsTrigger>
					{isHttpLogsPageEnabled && (
						<TabsTrigger value="requests" variant="regular" size="lg">
							Requests
						</TabsTrigger>
					)}
				</TabsList>
				<TabsContent value="workflow-runs">
					<ActivityFeedContent contentHeight="h-[calc(100vh-170px)]" />
				</TabsContent>
				<TabsContent value="requests" className="h-[calc(100vh-140px)]">
					<RequestsTable />
				</TabsContent>
			</Tabs>
		</>
	);
}
