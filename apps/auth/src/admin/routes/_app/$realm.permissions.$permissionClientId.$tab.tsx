import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PermissionsConfigurationSection = lazy(
    () =>
        import(
            "../../pages/permissions-configuration/permissions-configuration-section"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/$tab",
)({
    component: PermissionsConfigurationSection,
});
