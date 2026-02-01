/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/clients/routes/NewScope.tsx"
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

export type NewScopeParams = { realm: string; id: string };

const ScopeDetails = lazy(() => import("../authorization/ScopeDetails"));

export const NewScopeRoute: AppRouteObject = {
    path: "/:realm/clients/:id/authorization/scope/new",
    element: <ScopeDetails />,
    breadcrumb: t => t("createAuthorizationScope"),
    handle: {
        access: accessChecker =>
            accessChecker.hasAny("manage-clients", "manage-authorization")
    }
};

export const toNewScope = (params: NewScopeParams): Partial<Path> => ({
    pathname: generateEncodedPath(NewScopeRoute.path, params)
});
