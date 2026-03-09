import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/clients/$clientId/roles/$id/$tab")({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/realm-roles/realm-role-tabs"),
        "RealmRoleTabs"
    )
});
