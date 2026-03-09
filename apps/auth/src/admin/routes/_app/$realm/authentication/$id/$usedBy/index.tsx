import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/authentication/$id/$usedBy/")({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../pages/authentication/flow-details"),
        "FlowDetails"
    )
});
