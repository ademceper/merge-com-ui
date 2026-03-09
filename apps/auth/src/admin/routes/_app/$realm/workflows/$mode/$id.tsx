import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/workflows/$mode/$id")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../pages/workflows/workflow-detail-form"),
        "WorkflowDetailForm"
    )
});
