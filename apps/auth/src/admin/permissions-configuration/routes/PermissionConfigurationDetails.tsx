/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/PermissionConfigurationDetails.tsx"
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

export type PermissionConfigurationDetailsParams = {
    realm: string;
    permissionClientId: string;
    permissionId: string;
    resourceType: string;
};

const PermissionConfigurationDetails = lazy(
    () =>
        import("../../permissions-configuration/permission-configuration/PermissionConfigurationDetails")
);

export const PermissionConfigurationDetailRoute: AppRouteObject = {
    path: "/:realm/permissions/:permissionClientId/permission/:permissionId/:resourceType",
    element: <PermissionConfigurationDetails />,
    breadcrumb: t => t("permissionDetails"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny(
                "manage-clients",
                "view-authorization",
                "manage-authorization"
            )
    }
};

export const toPermissionConfigurationDetails = (
    params: PermissionConfigurationDetailsParams
): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionConfigurationDetailRoute.path, params)
});
