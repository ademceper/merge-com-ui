import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { DetailSkeleton } from "../../../../../../shared/ui/skeletons/detail-skeleton";

export const Route = createFileRoute("/_app/$realm/user-federation/ldap/$id/$tab")({
    pendingComponent: DetailSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../pages/user-federation/user-federation-ldap-settings"
            ),
        "UserFederationLdapSettings"
    )
});
