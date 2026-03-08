import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const SubscribersPage = lazy(() =>
	import("@/pages/subscribers/ui/subscribers").then((m) => ({
		default: m.SubscribersPage,
	})),
);

function SubscribersLayout() {
	return (
		<>
			<SubscribersPage />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/subscribers",
)({
	component: SubscribersLayout,
});
