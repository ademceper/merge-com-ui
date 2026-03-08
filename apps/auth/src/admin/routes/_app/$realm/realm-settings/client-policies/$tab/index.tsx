import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$tab/",
)({
    component: lazyRouteComponent(() => import("../../../../../../pages/realm-settings/policies-tab"), "PoliciesTab"),
});
