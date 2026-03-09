import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/organizations/new")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/organizations/new-organization"),
        "NewOrganization"
    )
});
