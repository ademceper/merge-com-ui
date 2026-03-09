import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/clients/$clientId/clientScopes/dedicated/$tab"
)({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/clients/scopes/dedicated-scopes"),
        "DedicatedScopes"
    )
});
