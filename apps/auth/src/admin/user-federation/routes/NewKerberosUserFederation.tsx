/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes/NewKerberosUserFederation.tsx"
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

export type NewKerberosUserFederationParams = { realm: string };

const UserFederationKerberosSettings = lazy(
    () => import("../UserFederationKerberosSettings")
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
