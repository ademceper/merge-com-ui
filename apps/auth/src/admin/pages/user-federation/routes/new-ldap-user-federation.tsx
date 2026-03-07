import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type NewLdapUserFederationParams = { realm: string };

const CreateUserFederationLdapSettings = lazy(
    () => import("../create-user-federation-ldap-settings")
);

export const NewLdapUserFederationRoute: AppRouteObject = {
    path: "/:realm/user-federation/ldap/new",
    element: <CreateUserFederationLdapSettings />,
    breadcrumb: t => t("addProvider", { provider: "LDAP", count: 1 }),
    handle: {
        access: "view-realm"
    }
};

export const toNewLdapUserFederation = (
    params: NewLdapUserFederationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewLdapUserFederationRoute.path, params)
});
