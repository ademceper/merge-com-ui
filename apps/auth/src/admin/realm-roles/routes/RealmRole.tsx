/**
 * WARNING: Before modifying this file, run the following command:
 *
 * $ npx keycloakify own --path "admin/realm-roles/routes/RealmRole.tsx"
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

export type RealmRoleTab =
    | "details"
    | "associated-roles"
    | "attributes"
    | "users-in-role"
    | "permissions"
    | "events";

export type RealmRoleParams = {
    realm: string;
    id: string;
    tab: RealmRoleTab;
};

const RealmRoleTabs = lazy(() => import("../RealmRoleTabs"));

export const RealmRoleRoute: AppRouteObject = {
    path: "/:realm/roles/:id/:tab",
    element: <RealmRoleTabs />,
    breadcrumb: t => t("roleDetails"),
    handle: {
        access: ["view-realm", "view-users"]
    }
};

export const toRealmRole = (params: RealmRoleParams): Partial<Path> => ({
    pathname: generateEncodedPath(RealmRoleRoute.path, params)
});
