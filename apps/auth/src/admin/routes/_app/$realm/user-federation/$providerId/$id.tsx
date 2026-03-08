import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/user-federation/$providerId/$id",
)({
    component: lazyRouteComponent(() => import("../../../../../pages/user-federation/custom/custom-provider-settings")),
});
