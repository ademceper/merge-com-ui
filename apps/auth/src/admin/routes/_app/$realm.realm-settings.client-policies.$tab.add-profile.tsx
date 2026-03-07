import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const ProfilesTab = lazy(
    () => import("../../pages/realm-settings/profiles-tab"),
);

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$tab/add-profile",
)({
    component: ProfilesTab,
});
