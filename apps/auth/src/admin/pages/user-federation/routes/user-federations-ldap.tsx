import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type UserFederationsLdapParams = { realm: string };

const UserFederationSection = lazy(() => import("../user-federation-section"));

export const UserFederationsLdapRoute: AppRouteObject = {
    path: "/:realm/user-federation/ldap",
    element: <UserFederationSection />,
    handle: {
        access: "view-realm"
    }
};

export const toUserFederationsLdap = (
    params: UserFederationsLdapParams
): Partial<Path> => ({
    pathname: generateEncodedPath(UserFederationsLdapRoute.path, params)
});
