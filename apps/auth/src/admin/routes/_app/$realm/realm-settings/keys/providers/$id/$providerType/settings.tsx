import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const KeyProviderFormPage = lazy(
    () =>
        import(
            "../../../../../../../../pages/realm-settings/keys/key-providers/key-provider-form"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/keys/providers/$id/$providerType/settings",
)({
    component: KeyProviderFormPage,
});
