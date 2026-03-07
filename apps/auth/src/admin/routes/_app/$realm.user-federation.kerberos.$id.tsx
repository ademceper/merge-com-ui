import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const UserFederationKerberosSettings = lazy(
    () =>
        import(
            "../../pages/user-federation/user-federation-kerberos-settings"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/user-federation/kerberos/$id",
)({
    component: UserFederationKerberosSettings,
});
