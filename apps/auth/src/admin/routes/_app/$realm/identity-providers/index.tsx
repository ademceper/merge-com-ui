import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/identity-providers/")({
    component: lazyRouteComponent(() => import("../../../../pages/identity-providers/identity-providers-section")),
});
