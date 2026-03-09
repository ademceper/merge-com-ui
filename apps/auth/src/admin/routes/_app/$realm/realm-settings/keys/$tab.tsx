import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/realm-settings/keys/$tab")({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../pages/realm-settings/keys/keys-tab"),
        "KeysTab"
    )
});
