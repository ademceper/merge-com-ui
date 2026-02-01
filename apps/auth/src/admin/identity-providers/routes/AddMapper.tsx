/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/AddMapper.tsx"
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

export type IdentityProviderAddMapperParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: string;
};

const AddMapper = lazy(() => import("../add/AddMapper"));

export const IdentityProviderAddMapperRoute: AppRouteObject = {
    path: "/:realm/identity-providers/:providerId/:alias/:tab/create",
    element: <AddMapper />,
    breadcrumb: t => t("addIdPMapper"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderAddMapper = (
    params: IdentityProviderAddMapperParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderAddMapperRoute.path, params)
});
