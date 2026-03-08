import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/$tab")({
    component: lazyRouteComponent(() => import("../../../pages/dashboard/dashboard"), "DashboardSection")
});
