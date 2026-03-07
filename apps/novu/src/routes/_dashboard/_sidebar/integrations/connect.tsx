import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateIntegrationSidebar = lazy(() =>
	import("@/pages/integrations/ui/create-integration-sidebar").then((m) => ({
		default: m.CreateIntegrationSidebar,
	})),
);

function ConnectIntegration() {
	return <CreateIntegrationSidebar isOpened />;
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/integrations/connect",
)({
	component: ConnectIntegration,
});
