import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/$clientId/clientScopes/dedicated/$tab",
)({
    component: lazyRouteComponent(() => import("../../../../../../../pages/clients/scopes/dedicated-scopes")),
});
