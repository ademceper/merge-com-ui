import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { UserFederationSkeleton } from "../../../../../shared/ui/skeletons/user-federation-skeleton";

export const Route = createFileRoute("/_app/$realm/user-federation/kerberos/")({
    pendingComponent: UserFederationSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../pages/user-federation/user-federation-kerberos-settings"
            ),
        "UserFederationKerberosSettings"
    )
});
