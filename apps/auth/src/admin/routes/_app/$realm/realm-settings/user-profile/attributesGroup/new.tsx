import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/user-profile/attributesGroup/new"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../pages/realm-settings/user-profile/attributes-group-form"
            ),
        "AttributesGroupForm"
    )
});
