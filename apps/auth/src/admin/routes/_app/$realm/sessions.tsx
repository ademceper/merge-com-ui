import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/sessions")({
    component: lazyRouteComponent(() => import("../../../pages/sessions/sessions-section")),
});
