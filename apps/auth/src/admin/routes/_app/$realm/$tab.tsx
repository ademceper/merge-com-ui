import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DashboardSkeleton } from "../../../shared/ui/skeletons/dashboard-skeleton";

export const Route = createFileRoute("/_app/$realm/$tab")({
    pendingComponent: DashboardSkeleton,
    component: lazyRouteComponent(() => import("../../../pages/dashboard/dashboard"), "DashboardSection")
});
