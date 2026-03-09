import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/client-scopes/new")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/client-scopes/create-client-scope"),
        "CreateClientScope"
    )
});
