/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/permissions-configuration/routes/NewPermissionPolicy.tsx"
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

export type NewPermissionPolicyDetailsParams = {
    realm: string;
    permissionClientId: string;
    policyType: string;
};

const NewPermissionPolicyDetails = lazy(
    () => import("../../clients/authorization/policy/PolicyDetails")
);

export const NewPermissionPolicyRoute: AppRouteObject = {
    path: "/:realm/permissions/:permissionClientId/policies/new/:policyType",
    element: <NewPermissionPolicyDetails />,
    breadcrumb: t => t("createPermissionPolicy"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("manage-clients", "manage-authorization")
    }
};

export const toCreatePermissionPolicy = (
    params: NewPermissionPolicyDetailsParams
): Partial<Path> => ({
    pathname: generateEncodedPath(NewPermissionPolicyRoute.path, params)
});
