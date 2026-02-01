/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/Clients.tsx"
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

export type ClientsTab = "list" | "initial-access-token" | "client-registration";

export type ClientsParams = {
    realm: string;
    tab?: ClientsTab;
};

const ClientsSection = lazy(() => import("../ClientsSection"));

export const ClientsRoute: AppRouteObject = {
    path: "/:realm/clients",
    element: <ClientsSection />,
    breadcrumb: t => t("clientList"),
    handle: {
        access: "query-clients"
    }
};

export const ClientsRouteWithTab: AppRouteObject = {
    ...ClientsRoute,
    path: "/:realm/clients/:tab"
};

export const toClients = (params: ClientsParams): Partial<Path> => {
    const path = params.tab ? ClientsRouteWithTab.path : ClientsRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
