import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/user-profile/attributesGroup/edit/$name"
)({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../pages/realm-settings/user-profile/attributes-group-form"
            ),
        "AttributesGroupForm"
    )
});
