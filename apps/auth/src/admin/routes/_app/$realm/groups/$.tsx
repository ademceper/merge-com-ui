import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/groups/$")({
    component: lazyRouteComponent(() => import("../../../../pages/groups/groups-section")),
});
