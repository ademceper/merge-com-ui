/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProviderKeycloakOidc.tsx"
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

export type IdentityProviderKeycloakOidcParams = { realm: string };

const AddOpenIdConnect = lazy(() => import("../add/AddOpenIdConnect"));

export const IdentityProviderKeycloakOidcRoute: AppRouteObject = {
    path: "/:realm/identity-providers/keycloak-oidc/add",
    element: <AddOpenIdConnect />,
    breadcrumb: t => t("addKeycloakOpenIdProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderKeycloakOidc = (
    params: IdentityProviderKeycloakOidcParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderKeycloakOidcRoute.path, params)
});
