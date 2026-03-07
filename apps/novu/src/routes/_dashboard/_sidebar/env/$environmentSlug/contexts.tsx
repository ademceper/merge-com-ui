import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const ContextsPage = lazy(() =>
	import("@/pages/contexts/ui/contexts").then((m) => ({
		default: m.ContextsPage,
	})),
);

function ContextsLayout() {
	return (
		<>
			<ContextsPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/contexts",
)({
	component: ContextsLayout,
});
