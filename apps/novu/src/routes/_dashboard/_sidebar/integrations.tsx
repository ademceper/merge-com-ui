import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const IntegrationsListPage = lazy(() =>
	import("@/pages/integrations/ui/integrations-list-page").then((m) => ({
		default: m.IntegrationsListPage,
	})),
);

function IntegrationsLayout() {
	return (
		<>
			<IntegrationsListPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute("/_dashboard/_sidebar/integrations")({
	component: IntegrationsLayout,
});
