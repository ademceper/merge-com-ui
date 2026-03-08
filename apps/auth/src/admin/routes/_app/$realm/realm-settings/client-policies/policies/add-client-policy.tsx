import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/policies/add-client-policy"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../pages/realm-settings/new-client-policy"),
        "NewClientPolicy"
    )
});
