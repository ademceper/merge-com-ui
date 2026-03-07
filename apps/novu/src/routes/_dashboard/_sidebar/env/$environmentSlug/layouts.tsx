import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const LayoutsPage = lazy(() =>
	import("@/pages/layouts/ui/layouts").then((m) => ({
		default: m.LayoutsPage,
	})),
);

function LayoutsListLayout() {
	return (
		<>
			<LayoutsPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/layouts",
)({
	component: LayoutsListLayout,
});
