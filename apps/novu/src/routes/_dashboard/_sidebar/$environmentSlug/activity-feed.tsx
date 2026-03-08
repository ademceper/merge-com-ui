import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ActivityFeed = lazy(() =>
	import("@/pages/activity/ui/activity-feed").then((m) => ({
		default: m.ActivityFeed,
	})),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/activity-feed",
)({
	component: ActivityFeed,
});
