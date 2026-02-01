/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/client-scopes/routes/ClientScope.tsx"
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

export type ClientScopeTab = "settings" | "mappers" | "scope" | "events";

export type ClientScopeParams = {
    realm: string;
    id: string;
    tab: ClientScopeTab;
};

const EditClientScope = lazy(() => import("../EditClientScope"));

export const ClientScopeRoute: AppRouteObject = {
    path: "/:realm/client-scopes/:id/:tab",
    element: <EditClientScope />,
    breadcrumb: t => t("clientScopeDetails"),
    handle: {
        access: "view-clients"
    }
};

export const toClientScope = (params: ClientScopeParams): Partial<Path> => {
    const path = ClientScopeRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
