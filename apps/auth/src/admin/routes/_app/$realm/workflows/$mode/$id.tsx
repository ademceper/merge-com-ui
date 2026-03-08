import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/workflows/$mode/$id")({
    component: lazyRouteComponent(
        () => import("../../../../../pages/workflows/workflow-detail-form"),
        "WorkflowDetailForm"
    )
});
