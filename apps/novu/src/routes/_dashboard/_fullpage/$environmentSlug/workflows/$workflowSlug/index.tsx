import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ConfigureWorkflow = lazy(() =>
	import("@/pages/workflows/ui/workflow-editor/configure-workflow").then(
		(m) => ({ default: m.ConfigureWorkflow }),
	),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/$environmentSlug/workflows/$workflowSlug/",
)({
	component: ConfigureWorkflow,
});
