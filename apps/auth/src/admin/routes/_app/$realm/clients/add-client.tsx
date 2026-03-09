import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/clients/add-client")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/clients/add/new-client-form"),
        "NewClientForm"
    )
});
