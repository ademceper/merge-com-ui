import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/permissions/$permissionClientId/$tab")(
    {
        component: lazyRouteComponent(
            () =>
                import(
                    "../../../../../pages/permissions-configuration/permissions-configuration-section"
                ),
            "PermissionsConfigurationSection"
        )
    }
);
