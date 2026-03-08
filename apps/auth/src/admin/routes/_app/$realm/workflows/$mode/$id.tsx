import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const WorkflowDetailForm = lazy(
    () => import("../../../../../pages/workflows/workflow-detail-form"),
);

export const Route = createFileRoute("/_app/$realm/workflows/$mode/$id")({
    component: WorkflowDetailForm,
});
