import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const WorkflowsSection = lazy(
    () => import("../../../../pages/workflows/workflows-section"),
);

export const Route = createFileRoute("/_app/$realm/workflows/")({
    component: WorkflowsSection,
});
