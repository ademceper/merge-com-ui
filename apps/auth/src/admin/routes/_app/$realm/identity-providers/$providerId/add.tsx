import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/$providerId/add",
)({
    component: lazyRouteComponent(() => import("../../../../../pages/identity-providers/add/add-identity-provider")),
});
