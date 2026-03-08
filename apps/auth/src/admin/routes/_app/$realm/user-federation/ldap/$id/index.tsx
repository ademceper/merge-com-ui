import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/user-federation/ldap/$id/")({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../../pages/user-federation/user-federation-ldap-settings"
            ),
        "UserFederationLdapSettings"
    )
});
