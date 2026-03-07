import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const SubscribersPage = lazy(() =>
	import("@/features/subscribers/ui/pages/subscribers").then((m) => ({
		default: m.SubscribersPage,
	})),
);
const EditSubscriberPage = lazy(() =>
	import("@/features/subscribers/ui/pages/edit-subscriber-page").then((m) => ({
		default: m.EditSubscriberPage,
	})),
);
const CreateSubscriberPage = lazy(() =>
	import("@/features/subscribers/ui/pages/create-subscriber").then((m) => ({
		default: m.CreateSubscriberPage,
	})),
);

export const subscribersDashboardRoutes: RouteObject = {
	path: ROUTES.SUBSCRIBERS,
	element: <SubscribersPage />,
	children: [
		{
			path: ROUTES.EDIT_SUBSCRIBER,
			element: <EditSubscriberPage />,
		},
		{
			path: ROUTES.CREATE_SUBSCRIBER,
			element: <CreateSubscriberPage />,
		},
	],
};
