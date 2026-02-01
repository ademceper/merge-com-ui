/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes/UserFederationLdapMapper.tsx"
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

export type UserFederationLdapMapperParams = {
    realm: string;
    id: string;
    mapperId: string;
};

const LdapMapperDetails = lazy(() => import("../ldap/mappers/LdapMapperDetails"));

export const UserFederationLdapMapperRoute: AppRouteObject = {
    path: "/:realm/user-federation/ldap/:id/mappers/:mapperId",
    element: <LdapMapperDetails />,
    breadcrumb: t => t("mappingDetails"),
    handle: {
        access: "view-realm"
    }
};

export const toUserFederationLdapMapper = (
    params: UserFederationLdapMapperParams
): Partial<Path> => ({
    pathname: generateEncodedPath(UserFederationLdapMapperRoute.path, params)
});
