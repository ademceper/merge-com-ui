import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const ApiKeysPage = lazy(() =>
	import("@/features/settings/ui/pages/api-keys").then((m) => ({
		default: m.ApiKeysPage,
	})),
);
const EnvironmentsPage = lazy(() =>
	import("@/features/settings/ui/pages/environments").then((m) => ({
		default: m.EnvironmentsPage,
	})),
);

export const settingsDashboardRoutes: RouteObject[] = [
	{
		path: ROUTES.API_KEYS,
		element: <ApiKeysPage />,
	},
	{
		path: ROUTES.ENVIRONMENTS,
		element: <EnvironmentsPage />,
	},
];
