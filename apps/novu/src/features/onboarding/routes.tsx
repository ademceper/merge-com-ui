import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import { ROUTES } from "@/utils/routes";

const InboxUsecasePage = lazy(() =>
	import("@/features/onboarding/pages/inbox-usecase-page").then((m) => ({
		default: m.InboxUsecasePage,
	})),
);
const InboxEmbedPage = lazy(() =>
	import("@/features/onboarding/pages/inbox-embed-page").then((m) => ({
		default: m.InboxEmbedPage,
	})),
);
const InboxEmbedSuccessPage = lazy(() =>
	import("@/features/onboarding/pages/inbox-embed-success-page").then(
		(m) => ({
			default: m.InboxEmbedSuccessPage,
		}),
	),
);
const WelcomePage = lazy(() =>
	import("@/features/onboarding/pages/welcome-page").then((m) => ({
		default: m.WelcomePage,
	})),
);

export const onboardingRoutes: RouteObject[] = [
	{
		path: ROUTES.INBOX_USECASE,
		element: <InboxUsecasePage />,
	},
	{
		path: ROUTES.INBOX_EMBED,
		element: <InboxEmbedPage />,
	},
	{
		path: ROUTES.INBOX_EMBED_SUCCESS,
		element: <InboxEmbedSuccessPage />,
	},
];

export const welcomeDashboardRoute: RouteObject = {
	path: ROUTES.WELCOME,
	element: <WelcomePage />,
};
