import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/events/")({
    component: lazyRouteComponent(() => import("../../../../pages/events/events-section")),
});
