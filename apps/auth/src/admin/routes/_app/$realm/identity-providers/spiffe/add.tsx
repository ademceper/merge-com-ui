import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/identity-providers/spiffe/add")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../pages/identity-providers/add/add-spiffe-connect"),
        "AddSamlConnect"
    )
});
