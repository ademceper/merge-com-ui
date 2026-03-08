import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const DuplicateWorkflowPage = lazy(
	() => import("@/pages/workflows/ui/duplicate-workflow"),
);

export const Route = createFileRoute(
	"/_dashboard/_sidebar/$environmentSlug/workflows/duplicate/$workflowId",
)({
	component: DuplicateWorkflowPage,
});
