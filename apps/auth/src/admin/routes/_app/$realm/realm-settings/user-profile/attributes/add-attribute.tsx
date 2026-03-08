import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const NewAttributeSettings = lazy(
    () => import("../../../../../../pages/realm-settings/new-attribute-settings"),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/user-profile/attributes/add-attribute",
)({
    component: NewAttributeSettings,
});
