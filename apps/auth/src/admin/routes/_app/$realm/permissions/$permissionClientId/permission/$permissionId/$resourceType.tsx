import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const PermissionConfigurationDetails = lazy(
    () =>
        import(
            "../../../../../../../pages/permissions-configuration/permission-configuration/permission-configuration-details"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/permission/$permissionId/$resourceType",
)({
    component: PermissionConfigurationDetails,
});
