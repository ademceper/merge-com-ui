/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/PermissionsPolicies.tsx"
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

export type PermissionsPoliciesParams = {
    realm: string;
    permissionClientId: string;
};

const PermissionsPoliciesSection = lazy(
    () => import("../PermissionsConfigurationSection")
);

export const PermissionsPoliciesRoute: AppRouteObject = {
    path: "/:realm/permissions/:permissionClientId/policies",
    element: <PermissionsPoliciesSection />,
    breadcrumb: t => t("policies"),
    handle: {
        access: ["view-realm", "view-clients", "view-users"]
    }
};

export const toPermissionsPolicies = (
    params: PermissionsPoliciesParams
): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionsPoliciesRoute.path, params)
});
