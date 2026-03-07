import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const EditStepTemplateV2Page = lazy(
	() => import("@/pages/workflows/ui/edit-step-template-v2"),
);

export const Route = createFileRoute(
	"/_dashboard/_fullpage/env/$environmentSlug/workflows/$workflowSlug/steps/$stepSlug/editor",
)({
	component: EditStepTemplateV2Page,
});
