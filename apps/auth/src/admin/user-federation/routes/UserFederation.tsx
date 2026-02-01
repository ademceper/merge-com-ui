/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/user-federation/routes/UserFederation.tsx"
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

export type UserFederationParams = { realm: string };

const UserFederationSection = lazy(() => import("../UserFederationSection"));

export const UserFederationRoute: AppRouteObject = {
    path: "/:realm/user-federation",
    element: <UserFederationSection />,
    breadcrumb: t => t("userFederation"),
    handle: {
        access: "view-realm"
    }
};

export const toUserFederation = (params: UserFederationParams): Partial<Path> => ({
    pathname: generateEncodedPath(UserFederationRoute.path, params)
});
