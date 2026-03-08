import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/$alias/$tab/create"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/identity-providers/add/add-mapper"),
        "AddMapper"
    )
});
