import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const UserFederationLdapSettings = lazy(
    () =>
        import(
            "../../../../../../pages/user-federation/user-federation-ldap-settings"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/user-federation/ldap/$id/$tab",
)({
    component: UserFederationLdapSettings,
});
