import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { GroupsSkeleton } from "../../../../shared/ui/skeletons/groups-skeleton";

export const Route = createFileRoute("/_app/$realm/groups/$")({
    pendingComponent: GroupsSkeleton,
    component: lazyRouteComponent(() => import("../../../../pages/groups/groups-section"), "GroupsSection")
});
