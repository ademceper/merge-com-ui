import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$tab/add-profile",
)({
    component: lazyRouteComponent(() => import("../../../../../../pages/realm-settings/profiles-tab")),
});
