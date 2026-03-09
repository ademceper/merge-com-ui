import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/user-profile/attributes/$attributeName/edit-attribute"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../../../../pages/realm-settings/new-attribute-settings"),
        "NewAttributeSettings"
    )
});
