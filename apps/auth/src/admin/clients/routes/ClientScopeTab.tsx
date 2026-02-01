/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/ClientScopeTab.tsx"
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

export type ClientScopesTab = "setup" | "evaluate";

export type ClientScopesParams = {
    realm: string;
    clientId: string;
    tab: ClientScopesTab;
};

const ClientDetails = lazy(() => import("../ClientDetails"));

export const ClientScopesRoute: AppRouteObject = {
    path: "/:realm/clients/:clientId/clientScopes/:tab",
    element: <ClientDetails />,
    breadcrumb: t => t("clientSettings"),
    handle: {
        access: "view-clients"
    }
};

export const toClientScopesTab = (params: ClientScopesParams): Partial<Path> => ({
    pathname: generateEncodedPath(ClientScopesRoute.path, params)
});
