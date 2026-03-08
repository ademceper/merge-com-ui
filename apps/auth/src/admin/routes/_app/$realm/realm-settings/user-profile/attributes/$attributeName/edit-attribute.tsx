import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/user-profile/attributes/$attributeName/edit-attribute"
)({
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/realm-settings/new-attribute-settings"),
        "NewAttributeSettings"
    )
});
