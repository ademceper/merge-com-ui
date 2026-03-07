import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditWorkflowPage = lazy(
	() => import("@/pages/workflows/ui/edit-workflow"),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/env/$environmentSlug/workflows/$workflowSlug/activity",
)({
	component: EditWorkflowPage,
});
