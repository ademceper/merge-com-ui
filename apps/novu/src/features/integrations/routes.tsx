import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const IntegrationsListPage = lazy(() =>
	import("@/features/integrations/ui/pages/integrations-list-page").then(
		(m) => ({
			default: m.IntegrationsListPage,
		}),
	),
);
const CreateIntegrationSidebar = lazy(() =>
	import(
		"@/features/integrations/ui/create-integration-sidebar"
	).then((m) => ({
		default: m.CreateIntegrationSidebar,
	})),
);
const UpdateIntegrationSidebar = lazy(() =>
	import(
		"@/features/integrations/ui/update-integration-sidebar"
	).then((m) => ({
		default: m.UpdateIntegrationSidebar,
	})),
);

export const integrationsDashboardRoutes: RouteObject = {
	path: ROUTES.INTEGRATIONS,
	element: <IntegrationsListPage />,
	children: [
		{
			path: ROUTES.INTEGRATIONS_CONNECT,
			element: <CreateIntegrationSidebar isOpened />,
		},
		{
			path: ROUTES.INTEGRATIONS_CONNECT_PROVIDER,
			element: <CreateIntegrationSidebar isOpened />,
		},
		{
			path: ROUTES.INTEGRATIONS_UPDATE,
			element: <UpdateIntegrationSidebar isOpened />,
		},
	],
};
