import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/client-scopes/$id/$tab")({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../pages/client-scopes/edit-client-scope"),
        "EditClientScope"
    )
});
