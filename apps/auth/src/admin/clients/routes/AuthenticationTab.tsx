/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/AuthenticationTab.tsx"
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

export type AuthorizationTab =
    | "settings"
    | "resources"
    | "scopes"
    | "policies"
    | "permissions"
    | "evaluate"
    | "export";

export type AuthorizationParams = {
    realm: string;
    clientId: string;
    tab: AuthorizationTab;
};

const ClientDetails = lazy(() => import("../ClientDetails"));

export const AuthorizationRoute: AppRouteObject = {
    path: "/:realm/clients/:clientId/authorization/:tab",
    element: <ClientDetails />,
    breadcrumb: t => t("clientSettings"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("view-authorization", "manage-authorization")
    }
};

export const toAuthorizationTab = (params: AuthorizationParams): Partial<Path> => ({
    pathname: generateEncodedPath(AuthorizationRoute.path, params)
});
