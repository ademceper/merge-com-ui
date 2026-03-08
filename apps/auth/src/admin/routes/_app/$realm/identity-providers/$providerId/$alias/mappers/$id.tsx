import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/$alias/mappers/$id"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/identity-providers/add/add-mapper"),
        "AddMapper"
    )
});
