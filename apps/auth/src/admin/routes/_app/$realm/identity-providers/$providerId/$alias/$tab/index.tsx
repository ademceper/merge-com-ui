import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/$alias/$tab/"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/identity-providers/add/detail-settings"),
        "DetailSettings"
    )
});
