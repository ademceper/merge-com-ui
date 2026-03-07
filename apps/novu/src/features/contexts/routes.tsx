import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const ContextsPage = lazy(() =>
	import("@/features/contexts/ui/pages/contexts").then((m) => ({
		default: m.ContextsPage,
	})),
);
const CreateContextPage = lazy(() =>
	import("@/features/contexts/ui/pages/create-context").then((m) => ({
		default: m.CreateContextPage,
	})),
);
const EditContextPage = lazy(() =>
	import("@/features/contexts/ui/pages/edit-context").then((m) => ({
		default: m.EditContextPage,
	})),
);

export const contextsDashboardRoutes: RouteObject = {
	path: ROUTES.CONTEXTS,
	element: <ContextsPage />,
	children: [
		{
			path: ROUTES.CONTEXTS_CREATE,
			element: <CreateContextPage />,
		},
		{
			path: ROUTES.CONTEXTS_EDIT,
			element: <EditContextPage />,
		},
	],
};
