/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/PermissionsConfiguration.tsx"
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

export type PermissionsConfigurationParams = { realm: string };

const PermissionsConfigurationSection = lazy(
    () => import("../PermissionsConfigurationSection")
);

export const PermissionsConfigurationRoute: AppRouteObject = {
    path: "/:realm/permissions",
    element: <PermissionsConfigurationSection />,
    breadcrumb: t => t("titlePermissions"),
    handle: {
        access: ["view-realm", "view-clients", "view-users"]
    }
};

export const toPermissionsConfiguration = (
    params: PermissionsConfigurationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionsConfigurationRoute.path, params)
});
