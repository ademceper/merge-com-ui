import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TemplateModal = lazy(() =>
	import("@/pages/workflows/ui/workflows").then((m) => ({
		default: m.TemplateModal,
	})),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/env/$environmentSlug/workflows/templates/$templateId",
)({
	component: TemplateModal,
});
