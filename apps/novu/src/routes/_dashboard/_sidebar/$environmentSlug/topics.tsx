import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const TopicsPage = lazy(() =>
	import("@/pages/topics/ui/topics").then((m) => ({
		default: m.TopicsPage,
	})),
);

function TopicsLayout() {
	return (
		<>
			<TopicsPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/topics",
)({
	component: TopicsLayout,
});
