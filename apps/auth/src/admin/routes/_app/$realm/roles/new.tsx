import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/roles/new")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/realm-roles/create-realm-role"),
        "CreateRealmRole"
    )
});
