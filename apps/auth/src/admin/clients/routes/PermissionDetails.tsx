/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/PermissionDetails.tsx"
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
import type { PermissionType } from "./NewPermission";

export type PermissionDetailsParams = {
    realm: string;
    id: string;
    permissionType: string | PermissionType;
    permissionId: string;
};

const PermissionDetails = lazy(() => import("../authorization/PermissionDetails"));

export const PermissionDetailsRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/permission/:permissionType/:permissionId",
    element: <PermissionDetails />,
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

export const toPermissionDetails = (params: PermissionDetailsParams): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionDetailsRoute.path, params)
});
