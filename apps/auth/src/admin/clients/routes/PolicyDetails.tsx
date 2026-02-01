/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/PolicyDetails.tsx"
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

export type PolicyDetailsParams = {
    realm: string;
    id: string;
    policyId: string;
    policyType: string;
};

const PolicyDetails = lazy(() => import("../authorization/policy/PolicyDetails"));

export const PolicyDetailsRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/policy/:policyId/:policyType",
    element: <PolicyDetails />,
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

export const toPolicyDetails = (params: PolicyDetailsParams): Partial<Path> => ({
    pathname: generateEncodedPath(PolicyDetailsRoute.path, params)
});
