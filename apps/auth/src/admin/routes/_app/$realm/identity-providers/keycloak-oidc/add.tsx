import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/keycloak-oidc/add",
)({
    component: lazyRouteComponent(() => import("../../../../../pages/identity-providers/add/add-open-id-connect")),
});
