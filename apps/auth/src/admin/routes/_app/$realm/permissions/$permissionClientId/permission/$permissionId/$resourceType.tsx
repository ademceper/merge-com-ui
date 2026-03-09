import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/permission/$permissionId/$resourceType"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../pages/permissions-configuration/permission-configuration/permission-configuration-details"
            ),
        "PermissionConfigurationDetails"
    )
});
