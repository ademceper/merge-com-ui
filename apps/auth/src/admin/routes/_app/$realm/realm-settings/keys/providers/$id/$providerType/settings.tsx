import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute(
    "/_app/$realm/realm-settings/keys/providers/$id/$providerType/settings"
)({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../../../pages/realm-settings/keys/key-providers/key-provider-form"
            ),
        "KeyProviderFormPage"
    )
});
