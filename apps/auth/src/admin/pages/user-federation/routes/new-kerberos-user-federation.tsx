import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type NewKerberosUserFederationParams = { realm: string };

const UserFederationKerberosSettings = lazy(
    () => import("../user-federation-kerberos-settings")
);

export const NewKerberosUserFederationRoute: AppRouteObject = {
    path: "/:realm/user-federation/kerberos/new",
    element: <UserFederationKerberosSettings />,
    breadcrumb: t => t("settings"),
    handle: {
        access: "view-realm"
    }
};

export const toNewKerberosUserFederation = (
    params: NewKerberosUserFederationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewKerberosUserFederationRoute.path, params)
});
