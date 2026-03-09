import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/clients/$id/clientScopes/dedicated/mappers/$mapperId/$viewMode"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../../../pages/client-scopes/details/mapping-details"
            ),
        "MappingDetails"
    )
});
