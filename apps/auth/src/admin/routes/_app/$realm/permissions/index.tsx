import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { PermissionsSkeleton } from "../../../../shared/ui/skeletons/permissions-skeleton";

export const Route = createFileRoute("/_app/$realm/permissions/")({
    pendingComponent: PermissionsSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../pages/permissions-configuration/permissions-configuration-section"
            ),
        "PermissionsConfigurationSection"
    )
});
