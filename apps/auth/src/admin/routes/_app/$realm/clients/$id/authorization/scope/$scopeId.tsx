import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/scope/$scopeId"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/clients/authorization/scope-details"),
        "ScopeDetails"
    )
});
