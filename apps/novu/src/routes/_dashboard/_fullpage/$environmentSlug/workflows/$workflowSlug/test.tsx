import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const TestWorkflowRouteHandler = lazy(
	() => import("@/pages/workflows/ui/test-workflow-route-handler"),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/$environmentSlug/workflows/$workflowSlug/test",
)({
	component: TestWorkflowRouteHandler,
});
