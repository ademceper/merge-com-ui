/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/NewPolicy.tsx"
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

export type NewPolicyParams = { realm: string; id: string; policyType: string };

const PolicyDetails = lazy(() => import("../authorization/policy/PolicyDetails"));

export const NewPolicyRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/policy/new/:policyType",
    element: <PolicyDetails />,
    breadcrumb: t => t("createPolicy"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("manage-clients", "manage-authorization")
    }
};

export const toCreatePolicy = (params: NewPolicyParams): Partial<Path> => ({
    pathname: generateEncodedPath(NewPolicyRoute.path, params)
});
