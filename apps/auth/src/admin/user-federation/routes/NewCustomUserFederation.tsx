/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes/NewCustomUserFederation.tsx"
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

export type NewCustomUserFederationRouteParams = {
    realm: string;
    providerId: string;
};

const CustomProviderSettings = lazy(() => import("../custom/CustomProviderSettings"));

export const NewCustomUserFederationRoute: AppRouteObject = {
    path: "/:realm/user-federation/:providerId/new",
    element: <CustomProviderSettings />,
    breadcrumb: t => t("addCustomProvider"),
    handle: {
        access: "view-realm"
    }
};

export const toNewCustomUserFederation = (
    params: NewCustomUserFederationRouteParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewCustomUserFederationRoute.path, params)
});
