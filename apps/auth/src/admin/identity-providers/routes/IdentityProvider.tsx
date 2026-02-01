/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/identity-providers/routes/IdentityProvider.tsx"
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

export type IdentityProviderTab = "settings" | "mappers" | "permissions" | "events";

export type IdentityProviderParams = {
    realm: string;
    providerId: string;
    alias: string;
    tab: IdentityProviderTab;
};

const DetailSettings = lazy(() => import("../add/DetailSettings"));

export const IdentityProviderRoute: AppRouteObject = {
    path: "/:realm/identity-providers/:providerId/:alias/:tab",
    element: <DetailSettings />,
    breadcrumb: t => t("providerDetails"),
    handle: {
        access: "view-identity-providers"
    }
};

export const toIdentityProvider = (params: IdentityProviderParams): Partial<Path> => ({
    pathname: generateEncodedPath(IdentityProviderRoute.path, params)
});
