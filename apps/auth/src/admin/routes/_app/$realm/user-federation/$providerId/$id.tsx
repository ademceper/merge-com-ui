import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/user-federation/$providerId/$id")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import("../../../../../pages/user-federation/custom/custom-provider-settings"),
        "CustomProviderSettings"
    )
});
