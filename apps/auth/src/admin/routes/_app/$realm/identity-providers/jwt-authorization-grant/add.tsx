import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/identity-providers/jwt-authorization-grant/add"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../pages/identity-providers/add/add-jwt-authorization-grant"
            ),
        "AddJWTAuthorizationGrantConnect"
    )
});
