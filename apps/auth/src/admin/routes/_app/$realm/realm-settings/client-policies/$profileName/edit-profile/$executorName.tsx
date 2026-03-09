import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/client-policies/$profileName/edit-profile/$executorName"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/realm-settings/executor-form"),
        "ExecutorForm"
    )
});
