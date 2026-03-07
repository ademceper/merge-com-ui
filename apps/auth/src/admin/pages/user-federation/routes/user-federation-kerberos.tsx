import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type UserFederationKerberosParams = {
    realm: string;
    id: string;
};

const UserFederationKerberosSettings = lazy(
    () => import("../user-federation-kerberos-settings")
);

export const UserFederationKerberosRoute: AppRouteObject = {
    path: "/:realm/user-federation/kerberos/:id",
    element: <UserFederationKerberosSettings />,
    breadcrumb: t => t("settings"),
    handle: {
        access: "view-realm"
    }
};

export const toUserFederationKerberos = (
    params: UserFederationKerberosParams
): Partial<Path> => ({
    pathname: generateEncodedPath(UserFederationKerberosRoute.path, params)
});
