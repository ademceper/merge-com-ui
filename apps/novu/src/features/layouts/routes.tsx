import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/utils/routes";

const LayoutsPage = lazy(() =>
	import("@/features/layouts/pages/layouts").then((m) => ({
		default: m.LayoutsPage,
	})),
);
const CreateLayoutPage = lazy(() =>
	import("@/features/layouts/pages/create-layout").then((m) => ({
		default: m.CreateLayoutPage,
	})),
);
const DuplicateLayoutPage = lazy(() =>
	import("@/features/layouts/pages/duplicate-layout-page").then((m) => ({
		default: m.DuplicateLayoutPage,
	})),
);
const EditLayoutPage = lazy(() =>
	import("@/features/layouts/pages/edit-layout").then((m) => ({
		default: m.EditLayoutPage,
	})),
);

export const layoutsDashboardRoutes: RouteObject = {
	path: ROUTES.LAYOUTS,
	element: <LayoutsPage />,
	children: [
		{
			path: ROUTES.LAYOUTS_CREATE,
			element: <CreateLayoutPage />,
		},
		{
			path: ROUTES.LAYOUTS_DUPLICATE,
			element: <DuplicateLayoutPage />,
		},
	],
};

export const layoutsFullPageRoutes: RouteObject[] = [
	{
		path: ROUTES.LAYOUTS_EDIT,
		element: <EditLayoutPage />,
	},
];
