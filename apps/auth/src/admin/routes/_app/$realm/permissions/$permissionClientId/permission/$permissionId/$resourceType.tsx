import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/permission/$permissionId/$resourceType"
)({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../pages/permissions-configuration/permission-configuration/permission-configuration-details"
            ),
        "PermissionConfigurationDetails"
    )
});
