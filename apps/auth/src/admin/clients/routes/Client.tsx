/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/Client.tsx"
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

export type ClientTab =
    | "settings"
    | "keys"
    | "credentials"
    | "roles"
    | "clientScopes"
    | "advanced"
    | "mappers"
    | "authorization"
    | "serviceAccount"
    | "permissions"
    | "sessions"
    | "events";

export type ClientParams = {
    realm: string;
    clientId: string;
    tab: ClientTab;
};

const ClientDetails = lazy(() => import("../ClientDetails"));

export const ClientRoute: AppRouteObject = {
    path: "/:realm/clients/:clientId/:tab",
    element: <ClientDetails />,
    breadcrumb: t => t("clientSettings"),
    handle: {
        access: "query-clients"
    }
};

export const toClient = (params: ClientParams): Partial<Path> => ({
    pathname: generateEncodedPath(ClientRoute.path, params)
});
