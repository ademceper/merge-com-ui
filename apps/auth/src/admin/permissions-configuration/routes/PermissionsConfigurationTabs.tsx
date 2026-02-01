/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/PermissionsConfigurationTabs.tsx"
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

export type PermissionsConfigurationTabs = "permissions" | "policies" | "evaluation";

export type PermissionsConfigurationTabsParams = {
    realm: string;
    permissionClientId: string;
    tab: PermissionsConfigurationTabs;
};

const PermissionsConfigurationSection = lazy(
    () => import("../PermissionsConfigurationSection")
);

export const PermissionsConfigurationTabsRoute: AppRouteObject = {
    path: "/:realm/permissions/:permissionClientId/:tab",
    element: <PermissionsConfigurationSection />,
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("view-realm", "view-clients", "view-users")
    }
};

export const toPermissionsConfigurationTabs = (
    params: PermissionsConfigurationTabsParams
): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionsConfigurationTabsRoute.path, params)
});
