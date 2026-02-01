/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/EditMapper.tsx"
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

export type IdentityProviderEditMapperParams = {
    realm: string;
    providerId: string;
    alias: string;
    id: string;
};

const AddMapper = lazy(() => import("../add/AddMapper"));

export const IdentityProviderEditMapperRoute: AppRouteObject = {
    path: "/:realm/identity-providers/:providerId/:alias/mappers/:id",
    element: <AddMapper />,
    breadcrumb: t => t("editIdPMapper"),
    handle: {
        access: "manage-identity-providers"
    }
};

export const toIdentityProviderEditMapper = (
    params: IdentityProviderEditMapperParams
): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderEditMapperRoute.path, params)
});
