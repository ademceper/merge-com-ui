import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ConfigureStep = lazy(() =>
	import("@/pages/workflows/ui/workflow-editor/steps/configure-step").then(
		(m) => ({ default: m.ConfigureStep }),
	),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/$environmentSlug/workflows/$workflowSlug/steps/$stepSlug/",
)({
	component: ConfigureStep,
});
