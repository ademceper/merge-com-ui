import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { IdentityProvidersSkeleton } from "../../../../shared/ui/skeletons/identity-providers-skeleton";

export const Route = createFileRoute("/_app/$realm/identity-providers/")({
    pendingComponent: IdentityProvidersSkeleton,
    component: lazyRouteComponent(
        () => import("../../../../pages/identity-providers/identity-providers-section"),
        "IdentityProvidersSection"
    )
});
