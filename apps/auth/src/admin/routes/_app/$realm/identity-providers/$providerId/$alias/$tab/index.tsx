import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/$alias/$tab/"
)({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/identity-providers/add/detail-settings"),
        "DetailSettings"
    )
});
