/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProviderCreate.tsx"
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

export type IdentityProviderCreateParams = {
    realm: string;
    providerId: string;
};

const AddIdentityProvider = lazy(() => import("../add/AddIdentityProvider"));

export const IdentityProviderCreateRoute: AppRouteObject = {
    path: "/:realm/identity-providers/:providerId/add",
    element: <AddIdentityProvider />,
    breadcrumb: t => t("addProvider"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderCreate = (
    params: IdentityProviderCreateParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderCreateRoute.path, params)
});
