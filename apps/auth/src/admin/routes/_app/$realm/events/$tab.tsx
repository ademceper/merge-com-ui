import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/events/$tab")({
    component: lazyRouteComponent(() => import("../../../../pages/events/events-section")),
});
