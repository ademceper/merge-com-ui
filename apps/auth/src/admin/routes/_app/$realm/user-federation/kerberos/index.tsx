import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$realm/user-federation/kerberos/")({
    component: lazyRouteComponent(
        () =>
            import(
                "../../../../../pages/user-federation/user-federation-kerberos-settings"
            ),
        "UserFederationKerberosSettings"
    )
});
