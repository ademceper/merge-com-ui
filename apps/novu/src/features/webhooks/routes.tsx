import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/shared/lib/routes";

const WebhooksPage = lazy(() =>
	import("@/features/webhooks/ui/pages/webhooks-page").then((m) => ({
		default: m.WebhooksPage,
	})),
);

export const webhooksDashboardRoutes: RouteObject[] = [
	{
		path: ROUTES.WEBHOOKS_ENDPOINTS,
		element: <WebhooksPage />,
	},
	{
		path: ROUTES.WEBHOOKS_EVENT_CATALOG,
		element: <WebhooksPage />,
	},
	{
		path: ROUTES.WEBHOOKS_LOGS,
		element: <WebhooksPage />,
	},
	{
		path: ROUTES.WEBHOOKS_ACTIVITY,
		element: <WebhooksPage />,
	},
	{
		path: ROUTES.WEBHOOKS,
		element: <Navigate to={ROUTES.WEBHOOKS_ENDPOINTS} replace />,
	},
];
