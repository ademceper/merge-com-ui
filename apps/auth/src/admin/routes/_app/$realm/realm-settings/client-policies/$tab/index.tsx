import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/realm-settings/client-policies/$tab/")(
    {
        pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
            () => import("../../../../../../pages/realm-settings/policies-tab"),
            "PoliciesTab"
        )
    }
);
