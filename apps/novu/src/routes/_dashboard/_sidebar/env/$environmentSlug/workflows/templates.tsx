import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy } from "react";

const TemplateModal = lazy(() =>
	import("@/pages/workflows/ui/workflows").then((m) => ({
		default: m.TemplateModal,
	})),
);

function TemplatesLayout() {
	return (
		<>
			<TemplateModal />
			<Outlet />
		</>
	);
}

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/workflows/templates",
)({
	component: TemplatesLayout,
});
