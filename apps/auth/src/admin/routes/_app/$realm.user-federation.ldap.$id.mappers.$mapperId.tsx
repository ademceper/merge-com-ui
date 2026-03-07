import { createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

const LdapMapperDetails = lazy(
    () =>
        import(
            "../../pages/user-federation/ldap/mappers/ldap-mapper-details"
        ),
);

export const Route = createFileRoute(
    "/_app/$realm/user-federation/ldap/$id/mappers/$mapperId",
)({
    component: LdapMapperDetails,
});
