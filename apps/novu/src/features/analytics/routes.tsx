import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const AnalyticsPage = lazy(() =>
	import("@/features/analytics/ui/pages/analytics").then((m) => ({
		default: m.AnalyticsPage,
	})),
);

export const analyticsDashboardRoutes: RouteObject = {
	path: ROUTES.ANALYTICS,
	element: <AnalyticsPage />,
};
