import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { FormSkeleton } from "../../../../../shared/ui/skeletons/form-skeleton";

export const Route = createFileRoute("/_app/$realm/user-federation/ldap/new")({
    pendingComponent: FormSkeleton,
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../pages/user-federation/create-user-federation-ldap-settings"
            ),
        "CreateUserFederationLdapSettings"
    )
});
