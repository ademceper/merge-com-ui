import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/client-scopes/new")({
    component: lazyRouteComponent(() => import("../../../../pages/client-scopes/create-client-scope")),
});
