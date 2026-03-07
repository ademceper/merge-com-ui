import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const UpdateIntegrationSidebar = lazy(() =>
	import("@/pages/integrations/ui/update-integration-sidebar").then((m) => ({
		default: m.UpdateIntegrationSidebar,
	})),
);

function UpdateIntegration() {
	return <UpdateIntegrationSidebar isOpened />;
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/integrations/$integrationId/update",
)({
	component: UpdateIntegration,
});
