import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TestWorkflowDrawerPage = lazy(
	() => import("@/pages/workflows/ui/test-workflow-drawer-page"),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/env/$environmentSlug/workflows/$workflowSlug/trigger",
)({
	component: TestWorkflowDrawerPage,
});
