import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/shared/lib/routes";

const TopicsPage = lazy(() =>
	import("@/features/topics/ui/pages/topics").then((m) => ({
		default: m.TopicsPage,
	})),
);
const CreateTopicPage = lazy(() =>
	import("@/features/topics/ui/pages/create-topic").then((m) => ({
		default: m.CreateTopicPage,
	})),
);
const EditTopicPage = lazy(() =>
	import("@/features/topics/ui/pages/edit-topic").then((m) => ({
		default: m.EditTopicPage,
	})),
);

export const topicsDashboardRoutes: RouteObject = {
	path: ROUTES.TOPICS,
	element: <TopicsPage />,
	children: [
		{
			path: ROUTES.TOPICS_CREATE,
			element: <CreateTopicPage />,
		},
		{
			path: ROUTES.TOPICS_EDIT,
			element: <EditTopicPage />,
		},
	],
};
