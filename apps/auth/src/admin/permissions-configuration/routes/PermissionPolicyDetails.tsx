/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/PermissionPolicyDetails.tsx"
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

export type PermissionPolicyDetailsParams = {
    realm: string;
    permissionClientId: string;
    policyId: string;
    policyType: string;
};

const PermissionPolicyDetails = lazy(
    () => import("../../clients/authorization/policy/PolicyDetails")
);

export const PermissionPolicyDetailsRoute: AppRouteObject = {
    path: "/:realm/permissions/:permissionClientId/policies/:policyId/:policyType",
    element: <PermissionPolicyDetails />,
    breadcrumb: t => t("policyDetails"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny(
                "manage-clients",
                "view-authorization",
                "manage-authorization"
            )
    }
};

export const toPermissionPolicyDetails = (
    params: PermissionPolicyDetailsParams
): Partial<Path> => ({
    pathname: generateEncodedPath(PermissionPolicyDetailsRoute.path, params)
});
