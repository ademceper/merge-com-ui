import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../../shared/lib/generateEncodedPath";
import type { AppRouteObject } from "../../../app/routes";

export type UserFederationsKerberosParams = { realm: string };

const UserFederationSection = lazy(() => import("../user-federation-section"));

export const UserFederationsKerberosRoute: AppRouteObject = {
    path: "/:realm/user-federation/kerberos",
    element: <UserFederationSection />,
    handle: {
        access: "view-realm"
    }
};

export const toUserFederationsKerberos = (
    params: UserFederationsKerberosParams
): Partial<Path> => ({
    pathname: generateEncodedPath(UserFederationsKerberosRoute.path, params)
});
