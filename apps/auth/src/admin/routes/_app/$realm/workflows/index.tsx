import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { adminClient } from "../../../../app/admin-client";
import { workflowsQueryOptions } from "../../../../pages/workflows/hooks/use-workflows";
import { WorkflowsSkeleton } from "../../../../shared/ui/skeletons/workflows-skeleton";

export const Route = createFileRoute("/_app/$realm/workflows/")({
    loader: ({ context: { queryClient } }) => {
        if (!adminClient) return;
        return queryClient.ensureQueryData(workflowsQueryOptions());
    },
    pendingComponent: WorkflowsSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/workflows/workflows-section"),
        "WorkflowsSection"
    )
});
