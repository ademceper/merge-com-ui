import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AnalyticsPage = lazy(() =>
	import("@/pages/analytics/ui/analytics").then((m) => ({
		default: m.AnalyticsPage,
	})),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/analytics",
)({
	component: AnalyticsPage,
});
