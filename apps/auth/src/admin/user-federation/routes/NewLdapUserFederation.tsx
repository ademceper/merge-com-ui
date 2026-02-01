/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes/NewLdapUserFederation.tsx"
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

export type NewLdapUserFederationParams = { realm: string };

const CreateUserFederationLdapSettings = lazy(
    () => import("../CreateUserFederationLdapSettings")
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
