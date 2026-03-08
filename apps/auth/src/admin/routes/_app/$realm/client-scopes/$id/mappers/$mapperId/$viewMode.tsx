import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/client-scopes/$id/mappers/$mapperId/$viewMode",
)({
    component: lazyRouteComponent(() => import("../../../../../../../pages/client-scopes/details/mapping-details")),
});
