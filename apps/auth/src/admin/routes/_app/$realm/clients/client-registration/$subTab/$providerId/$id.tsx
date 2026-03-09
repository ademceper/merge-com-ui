import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/clients/client-registration/$subTab/$providerId/$id"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/clients/registration/detail-provider"),
        "DetailProvider"
    )
});
