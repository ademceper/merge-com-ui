import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/policies/"
)({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../pages/permissions-configuration/permissions-configuration-section"
            ),
        "PermissionsConfigurationSection"
    )
});
