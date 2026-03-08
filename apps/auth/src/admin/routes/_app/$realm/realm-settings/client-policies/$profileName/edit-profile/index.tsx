import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ClientProfileForm = lazy(
    () => import("../../../../../../../pages/realm-settings/client-profile-form"),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$profileName/edit-profile/",
)({
    component: ClientProfileForm,
});
