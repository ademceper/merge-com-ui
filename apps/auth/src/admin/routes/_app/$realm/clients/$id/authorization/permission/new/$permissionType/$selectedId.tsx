import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/authorization/permission/new/$permissionType/$selectedId"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../../../pages/clients/authorization/permission-details"
            ),
        "PermissionDetails"
    )
});
