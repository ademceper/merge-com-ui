/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/DedicatedScopeDetails.tsx"
 *
 * This file is provided by @keycloakify/keycloak-admin-ui version 260502.0.0.
 * It was copied into your repository by the postinstall script: `keycloakify sync-extensions`.
 */

/* eslint-disable */

// @ts-nocheck

import { lazy } from "react";
import type { Path } from "react-router-dom";
import type { AppRouteObject } from "../../routes";
import { generateEncodedPath } from "../../utils/generateEncodedPath";

export type DedicatedScopeTab = "mappers" | "scope";

export type DedicatedScopeDetailsParams = {
    realm: string;
    clientId: string;
    tab?: DedicatedScopeTab;
};

const DedicatedScopes = lazy(() => import("../scopes/DedicatedScopes"));

export const DedicatedScopeDetailsRoute: AppRouteObject = {
    path: "/:realm/clients/:clientId/clientScopes/dedicated",
    element: <DedicatedScopes />,
    breadcrumb: t => t("dedicatedScopes"),
    handle: {
        access: "view-clients"
    }
};

export const DedicatedScopeDetailsWithTabRoute: AppRouteObject = {
    ...DedicatedScopeDetailsRoute,
    path: "/:realm/clients/:clientId/clientScopes/dedicated/:tab"
};

export const toDedicatedScope = (params: DedicatedScopeDetailsParams): Partial<Path> => {
    const path = params.tab
        ? DedicatedScopeDetailsWithTabRoute.path
        : DedicatedScopeDetailsRoute.path;

    return {
        pathname: generateEncodedPath(path, params)
    };
};
