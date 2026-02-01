/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/routes/ClientScopes.tsx"
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

export type ClientScopesParams = { realm: string };

const ClientScopesSection = lazy(() => import("../ClientScopesSection"));

export const ClientScopesRoute: AppRouteObject = {
    path: "/:realm/client-scopes",
    element: <ClientScopesSection />,
    breadcrumb: t => t("clientScopeList"),
    handle: {
        access: "view-clients"
    }
};

export const toClientScopes = (params: ClientScopesParams): Partial<Path> => ({
    pathname: generateEncodedPath(ClientScopesRoute.path, params)
});
