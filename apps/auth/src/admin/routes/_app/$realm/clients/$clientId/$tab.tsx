import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/clients/$clientId/$tab")({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../pages/clients/client-details"),
        "ClientDetails"
    )
});
