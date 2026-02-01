/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProviderJWTAuthorizationGrant.tsx"
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

export type IdentityProviderJWTAuthorizationGrantParams = { realm: string };

const AddJWTAuthorizationGrant = lazy(() => import("../add/AddJWTAuthorizationGrant"));

export const IdentityProviderJWTAuthorizationGrantRoute: AppRouteObject = {
    path: "/:realm/identity-providers/jwt-authorization-grant/add",
    element: <AddJWTAuthorizationGrant />,
    breadcrumb: t => t("addJWTAuthorizationGrantProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderJWTAuthorizationGrant = (
    params: IdentityProviderJWTAuthorizationGrantParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderJWTAuthorizationGrantRoute.path, params)
});
