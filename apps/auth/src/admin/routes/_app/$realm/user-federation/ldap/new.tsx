import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/user-federation/ldap/new")({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../pages/user-federation/create-user-federation-ldap-settings"
            ),
        "CreateUserFederationLdapSettings"
    )
});
