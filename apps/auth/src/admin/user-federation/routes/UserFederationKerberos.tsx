/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes/UserFederationKerberos.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import { generateEncodedPath } from "../../utils/generateEncodedPath";
import type { AppRouteObject } from "../../routes";

export type UserFederationKerberosParams = {
    realm: string;
    id: string;
};

const UserFederationKerberosSettings = lazy(
    () => import("../UserFederationKerberosSettings")
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
