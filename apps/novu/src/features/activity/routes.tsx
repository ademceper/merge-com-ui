import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const ActivityFeed = lazy(() =>
	import("@/features/activity/ui/pages/activity-feed").then((m) => ({
		default: m.ActivityFeed,
	})),
);

export const activityDashboardRoutes: RouteObject[] = [
	{
		path: ROUTES.ACTIVITY_FEED,
		element: <ActivityFeed />,
	},
	{
		path: ROUTES.ACTIVITY_WORKFLOW_RUNS,
		element: <ActivityFeed />,
	},
	{
		path: ROUTES.ACTIVITY_REQUESTS,
		element: <ActivityFeed />,
	},
];
