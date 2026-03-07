import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const WorkflowsPage = lazy(() =>
	import("@/pages/workflows/ui/workflows").then((m) => ({
		default: m.WorkflowsPage,
	})),
);

function WorkflowsLayout() {
	return (
		<>
			<WorkflowsPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/workflows",
)({
	component: WorkflowsLayout,
});
