import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/organizations/new")({
    component: lazyRouteComponent(() => import("../../../../pages/organizations/new-organization")),
});
