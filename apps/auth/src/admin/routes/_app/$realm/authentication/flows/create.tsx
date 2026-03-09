import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/authentication/flows/create")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../pages/authentication/form/create-flow"),
        "CreateFlow"
    )
});
