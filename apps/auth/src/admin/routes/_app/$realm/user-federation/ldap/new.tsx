import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const CreateUserFederationLdapSettings = lazy(
    () =>
        import(
            "../../../../../pages/user-federation/create-user-federation-ldap-settings"
        ),
);

export const Route = createFileRoute("/_app/$realm/user-federation/ldap/new")({
    component: CreateUserFederationLdapSettings,
});
