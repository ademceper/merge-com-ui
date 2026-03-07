import "@merge-rd/ui/globals.css";

import { KeycloakProvider } from "@merge-rd/auth";
import { Providers } from "@merge-rd/ui/components/providers";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ErrorPage } from "@/pages/error-page";
import { activityDashboardRoutes } from "@/features/activity/routes";
import { analyticsDashboardRoutes } from "@/features/analytics/routes";
import { contextsDashboardRoutes } from "@/features/contexts/routes";
import { integrationsDashboardRoutes } from "@/features/integrations/routes";
import {
	layoutsDashboardRoutes,
	layoutsFullPageRoutes,
} from "@/features/layouts/routes";
import {
	onboardingRoutes,
	welcomeDashboardRoute,
} from "@/features/onboarding/routes";
import { settingsDashboardRoutes } from "@/features/settings/routes";
import { subscribersDashboardRoutes } from "@/features/subscribers/routes";
import { topicsDashboardRoutes } from "@/features/topics/routes";
import { translationsDashboardRoutes } from "@/features/translations/routes";
import { webhooksDashboardRoutes } from "@/features/webhooks/routes";
import {
	workflowsDashboardRoutes,
	workflowsFullPageRoutes,
} from "@/features/workflows/routes";
import { FeatureFlagsProvider } from "./context/feature-flags-provider";
import { CatchAllRoute, DashboardRoute, RootRoute } from "./routes";
import { DashboardLayoutRoute } from "./routes/dashboard-layout-route";
import { FullPageLayoutRoute } from "./routes/full-page-layout-route";
import { OnboardingParentRoute } from "./routes/onboarding";
import { ROUTES } from "@/shared/lib/routes";
import { initializeSentry } from "@/shared/lib/sentry";
import { overrideZodErrorMap } from "@/shared/lib/validation";

initializeSentry();
overrideZodErrorMap();

const router = createBrowserRouter([
	{
		element: <RootRoute />,
		errorElement: <ErrorPage />,
		children: [
			{
				path: "/onboarding",
				element: <OnboardingParentRoute />,
				children: onboardingRoutes,
			},
			{
				path: ROUTES.ROOT,
				element: <DashboardRoute />,
				children: [
					{
						element: <DashboardLayoutRoute />,
						children: [
							{
								index: true,
								element: <CatchAllRoute />,
							},
							{
								path: ROUTES.ENV,
								children: [
									welcomeDashboardRoute,
									workflowsDashboardRoutes,
									subscribersDashboardRoutes,
									topicsDashboardRoutes,
									contextsDashboardRoutes,
									layoutsDashboardRoutes,
									translationsDashboardRoutes,
									analyticsDashboardRoutes,
									...settingsDashboardRoutes,
									...activityDashboardRoutes,
									...webhooksDashboardRoutes,
									{
										path: "*",
										element: <CatchAllRoute />,
									},
								],
							},
							integrationsDashboardRoutes,
							{
								path: "*",
								element: <CatchAllRoute />,
							},
						],
					},
					{
						element: <FullPageLayoutRoute />,
						children: [
							{
								path: ROUTES.ENV,
								children: [
									...workflowsFullPageRoutes,
									...layoutsFullPageRoutes,
								],
							},
						],
					},
				],
			},
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<KeycloakProvider
			issuerUri={import.meta.env.VITE_OIDC_ISSUER_URI}
			clientId={import.meta.env.VITE_OIDC_CLIENT_ID}
			fallback={
				<div className="flex h-svh items-center justify-center">Loading...</div>
			}
		>
			<Providers>
				<FeatureFlagsProvider>
					<RouterProvider router={router} />
				</FeatureFlagsProvider>
			</Providers>
		</KeycloakProvider>
	</StrictMode>,
);
