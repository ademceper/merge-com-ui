import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/permissions/$permissionClientId/policies/$policyId/$policyType"
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
