import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/keys/providers/$id/$providerType/settings"
)({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../../pages/realm-settings/keys/key-providers/key-provider-form"
            ),
        "KeyProviderFormPage"
    )
});
