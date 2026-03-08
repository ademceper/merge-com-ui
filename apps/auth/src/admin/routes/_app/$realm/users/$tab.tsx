import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/users/$tab")({
    component: lazyRouteComponent(() => import("../../../../pages/user/users-section")),
});
