import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/authentication/")({
    component: lazyRouteComponent(() => import("../../../../pages/authentication/authentication-section")),
});
