import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const AttributesGroupForm = lazy(
    () =>
        import(
            "../../../../../../pages/realm-settings/user-profile/attributes-group-form"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/user-profile/attributesGroup/new",
)({
    component: AttributesGroupForm,
});
