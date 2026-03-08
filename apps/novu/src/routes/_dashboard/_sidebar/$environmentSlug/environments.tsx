import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EnvironmentsPage = lazy(() =>
	import("@/pages/settings/ui/environments").then((m) => ({
		default: m.EnvironmentsPage,
	})),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/environments",
)({
	component: EnvironmentsPage,
});
