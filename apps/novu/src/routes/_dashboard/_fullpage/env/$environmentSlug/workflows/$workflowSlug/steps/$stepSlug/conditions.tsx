import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditStepConditions = lazy(() =>
	import(
		"@/pages/workflows/ui/workflow-editor/steps/conditions/edit-step-conditions"
	).then((m) => ({ default: m.EditStepConditions })),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/env/$environmentSlug/workflows/$workflowSlug/steps/$stepSlug/conditions",
)({
	component: EditStepConditions,
});
