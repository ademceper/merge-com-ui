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

import type { AppRouteObject } from "../../routes";
import {
    CLIENTS_PATH,
    CLIENTS_PATH_WITH_TAB,
    type ClientsParams,
    type ClientsTab,
    toClients
} from "./clients-path";
import ClientsSection from "../ClientsSection";

export type { ClientsParams, ClientsTab };
export { toClients };

export const ClientsRoute: AppRouteObject = {
    path: CLIENTS_PATH,
    element: <ClientsSection />,
    breadcrumb: t => t("clientList"),
    handle: {
        access: "query-clients"
    }
};

export const ClientsRouteWithTab: AppRouteObject = {
    ...ClientsRoute,
    path: CLIENTS_PATH_WITH_TAB
};
