import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute(
    "/_app/$realm/user-federation/ldap/$id/mappers/$mapperId",
)({
    component: lazyRouteComponent(() => import(
            "../../../../../../../pages/user-federation/ldap/mappers/ldap-mapper-details"
        )),
});
