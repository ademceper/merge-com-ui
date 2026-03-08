import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/jwt-authorization-grant/add",
)({
    component: lazyRouteComponent(() => import(
            "../../../../../pages/identity-providers/add/add-jwt-authorization-grant"
        )),
});
