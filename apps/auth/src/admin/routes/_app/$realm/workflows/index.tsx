import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/workflows/")({
    component: lazyRouteComponent(
        () => import("../../../../pages/workflows/workflows-section"),
        "WorkflowsSection"
    )
});
