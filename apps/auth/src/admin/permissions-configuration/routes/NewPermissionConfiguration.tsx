/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/NewPermissionConfiguration.tsx"
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

export type NewPermissionConfigurationParams = {
    realm: string;
    permissionClientId: string;
    resourceType: string;
};

const PermissionConfigurationDetails = lazy(
    () => import("../permission-configuration/PermissionConfigurationDetails")
);

export const NewPermissionConfigurationRoute: AppRouteObject = {
    path: "/:realm/permissions/:permissionClientId/permission/new/:resourceType",
    element: <PermissionConfigurationDetails />,
    breadcrumb: t => t("createPermission"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("manage-clients", "manage-authorization")
    }
};

export const toCreatePermissionConfiguration = (
    params: NewPermissionConfigurationParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewPermissionConfigurationRoute.path, params)
});
