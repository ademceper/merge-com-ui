import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$")({
    component: lazyRouteComponent(() => import("../../pages/catch-all-route"), "CatchAllRoute"),
});
