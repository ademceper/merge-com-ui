import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/clients/$clientId/roles/new")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../pages/clients/roles/create-client-role"),
        "CreateClientRole"
    )
});
